import { expect } from "chai";
import { ethers } from "hardhat";
import { MultiSend } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("MultiSend", function () {
    async function deployMultiSendFixture() {
        const [owner, addr1, addr2, addr3] = await ethers.getSigners();
        const MultiSend = await ethers.getContractFactory("MultiSend");
        const multiSend = await MultiSend.deploy();
        await multiSend.waitForDeployment();

        return { multiSend, owner, addr1, addr2, addr3 };
    }

    describe("Deployment", function () {
        it("Should deploy successfully", async function () {
            const { multiSend } = await loadFixture(deployMultiSendFixture);
            expect(await multiSend.getAddress()).to.be.properAddress;
        });
    });

    describe("multiSendNative", function () {
        it("Should send native tokens to multiple recipients", async function () {
            const { multiSend, owner, addr1, addr2, addr3 } = await loadFixture(deployMultiSendFixture);

            const recipients = [addr1.address, addr2.address, addr3.address];
            const amounts = [
                ethers.parseEther("1.0"),
                ethers.parseEther("2.0"),
                ethers.parseEther("3.0")
            ];
            const totalAmount = ethers.parseEther("6.0");

            const initialBalance1 = await ethers.provider.getBalance(addr1.address);
            const initialBalance2 = await ethers.provider.getBalance(addr2.address);
            const initialBalance3 = await ethers.provider.getBalance(addr3.address);

            await multiSend.multiSendNative(recipients, amounts, { value: totalAmount });

            expect(await ethers.provider.getBalance(addr1.address)).to.equal(
                initialBalance1 + amounts[0]
            );
            expect(await ethers.provider.getBalance(addr2.address)).to.equal(
                initialBalance2 + amounts[1]
            );
            expect(await ethers.provider.getBalance(addr3.address)).to.equal(
                initialBalance3 + amounts[2]
            );
        });

        it("Should refund excess ETH to sender", async function () {
            const { multiSend, owner, addr1 } = await loadFixture(deployMultiSendFixture);

            const recipients = [addr1.address];
            const amounts = [ethers.parseEther("1.0")];
            const sentValue = ethers.parseEther("2.0"); // Send more than needed

            const initialOwnerBalance = await ethers.provider.getBalance(owner.address);

            const tx = await multiSend.multiSendNative(recipients, amounts, { value: sentValue });
            const receipt = await tx.wait();
            const gasUsed = receipt!.gasUsed * receipt!.gasPrice;

            const finalOwnerBalance = await ethers.provider.getBalance(owner.address);

            // Owner should have spent only the required amount + gas
            expect(initialOwnerBalance - finalOwnerBalance).to.be.closeTo(
                amounts[0] + gasUsed,
                ethers.parseEther("0.001") // Small tolerance for gas estimation
            );
        });

        it("Should revert if arrays length mismatch", async function () {
            const { multiSend, addr1, addr2 } = await loadFixture(deployMultiSendFixture);

            const recipients = [addr1.address, addr2.address];
            const amounts = [ethers.parseEther("1.0")]; // Mismatched length

            await expect(
                multiSend.multiSendNative(recipients, amounts, { value: ethers.parseEther("1.0") })
            ).to.be.revertedWithCustomError(multiSend, "LengthMismatch");
        });

        it("Should revert if no recipients", async function () {
            const { multiSend } = await loadFixture(deployMultiSendFixture);

            await expect(
                multiSend.multiSendNative([], [], { value: 0 })
            ).to.be.revertedWithCustomError(multiSend, "NoRecipients");
        });

        it("Should revert if too many recipients (>255)", async function () {
            const { multiSend } = await loadFixture(deployMultiSendFixture);

            const recipients = Array(256).fill(ethers.Wallet.createRandom().address);
            const amounts = Array(256).fill(ethers.parseEther("0.01"));

            await expect(
                multiSend.multiSendNative(recipients, amounts, { value: ethers.parseEther("2.56") })
            ).to.be.revertedWithCustomError(multiSend, "TooManyRecipients");
        });

        it("Should revert if insufficient value sent", async function () {
            const { multiSend, addr1, addr2 } = await loadFixture(deployMultiSendFixture);

            const recipients = [addr1.address, addr2.address];
            const amounts = [ethers.parseEther("1.0"), ethers.parseEther("2.0")];
            const insufficientValue = ethers.parseEther("2.5"); // Less than 3.0 needed

            await expect(
                multiSend.multiSendNative(recipients, amounts, { value: insufficientValue })
            ).to.be.revertedWithCustomError(multiSend, "InsufficientValue");
        });

        it("Should revert if recipient is zero address", async function () {
            const { multiSend } = await loadFixture(deployMultiSendFixture);

            const recipients = [ethers.ZeroAddress];
            const amounts = [ethers.parseEther("1.0")];

            await expect(
                multiSend.multiSendNative(recipients, amounts, { value: ethers.parseEther("1.0") })
            ).to.be.revertedWithCustomError(multiSend, "InvalidRecipient");
        });

        it("Should emit NativeSent event", async function () {
            const { multiSend, owner, addr1, addr2 } = await loadFixture(deployMultiSendFixture);

            const recipients = [addr1.address, addr2.address];
            const amounts = [ethers.parseEther("1.0"), ethers.parseEther("2.0")];
            const totalAmount = ethers.parseEther("3.0");

            await expect(multiSend.multiSendNative(recipients, amounts, { value: totalAmount }))
                .to.emit(multiSend, "NativeSent")
                .withArgs(owner.address, totalAmount, 2);
        });
    });

    describe("multiSendToken", function () {
        let mockToken: any;

        beforeEach(async function () {
            const { owner } = await loadFixture(deployMultiSendFixture);
            const MockERC20 = await ethers.getContractFactory("MockERC20");
            mockToken = await MockERC20.deploy("Mock Token", "MTK", ethers.parseEther("1000000"));
            await mockToken.waitForDeployment();
        });

        it("Should send ERC20 tokens to multiple recipients", async function () {
            const { multiSend, owner, addr1, addr2, addr3 } = await loadFixture(deployMultiSendFixture);

            const recipients = [addr1.address, addr2.address, addr3.address];
            const amounts = [
                ethers.parseEther("100"),
                ethers.parseEther("200"),
                ethers.parseEther("300")
            ];
            const totalAmount = ethers.parseEther("600");

            // Approve tokens
            await mockToken.approve(await multiSend.getAddress(), totalAmount);

            await multiSend.multiSendToken(await mockToken.getAddress(), recipients, amounts, totalAmount);

            expect(await mockToken.balanceOf(addr1.address)).to.equal(amounts[0]);
            expect(await mockToken.balanceOf(addr2.address)).to.equal(amounts[1]);
            expect(await mockToken.balanceOf(addr3.address)).to.equal(amounts[2]);
        });

        it("Should revert if arrays length mismatch", async function () {
            const { multiSend, addr1, addr2 } = await loadFixture(deployMultiSendFixture);

            const recipients = [addr1.address, addr2.address];
            const amounts = [ethers.parseEther("100")];
            const totalAmount = ethers.parseEther("100");

            await expect(
                multiSend.multiSendToken(await mockToken.getAddress(), recipients, amounts, totalAmount)
            ).to.be.revertedWithCustomError(multiSend, "LengthMismatch");
        });

        it("Should revert if total amount is zero", async function () {
            const { multiSend, addr1 } = await loadFixture(deployMultiSendFixture);

            const recipients = [addr1.address];
            const amounts = [ethers.parseEther("0")];

            await expect(
                multiSend.multiSendToken(await mockToken.getAddress(), recipients, amounts, 0)
            ).to.be.revertedWithCustomError(multiSend, "ZeroTotalAmount");
        });

        it("Should revert if calculated total doesn't match provided total", async function () {
            const { multiSend, addr1, addr2 } = await loadFixture(deployMultiSendFixture);

            const recipients = [addr1.address, addr2.address];
            const amounts = [ethers.parseEther("100"), ethers.parseEther("200")];
            const wrongTotal = ethers.parseEther("250"); // Should be 300

            await expect(
                multiSend.multiSendToken(await mockToken.getAddress(), recipients, amounts, wrongTotal)
            ).to.be.revertedWithCustomError(multiSend, "TotalAmountMismatch");
        });

        it("Should emit TokenSent event", async function () {
            const { multiSend, owner, addr1, addr2 } = await loadFixture(deployMultiSendFixture);

            const recipients = [addr1.address, addr2.address];
            const amounts = [ethers.parseEther("100"), ethers.parseEther("200")];
            const totalAmount = ethers.parseEther("300");

            await mockToken.approve(await multiSend.getAddress(), totalAmount);

            await expect(
                multiSend.multiSendToken(await mockToken.getAddress(), recipients, amounts, totalAmount)
            )
                .to.emit(multiSend, "TokenSent")
                .withArgs(owner.address, await mockToken.getAddress(), totalAmount, 2);
        });
    });

    describe("Reentrancy Protection", function () {
        it("Should prevent reentrancy attacks on multiSendNative", async function () {
            const { multiSend, addr1 } = await loadFixture(deployMultiSendFixture);

            // Deploy a malicious contract that attempts reentrancy
            const MaliciousReceiver = await ethers.getContractFactory("MaliciousReceiver");
            const malicious = await MaliciousReceiver.deploy(await multiSend.getAddress());
            await malicious.waitForDeployment();

            const recipients = [await malicious.getAddress()];
            const amounts = [ethers.parseEther("1.0")];

            // The malicious contract will try to reenter, but should fail
            await expect(
                multiSend.multiSendNative(recipients, amounts, { value: ethers.parseEther("1.0") })
            ).to.be.reverted;
        });
    });
});

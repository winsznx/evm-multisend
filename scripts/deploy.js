const hre = require("hardhat");

async function main() {
    console.log("Deploying MultiSend contract...");

    const MultiSend = await hre.ethers.getContractFactory("MultiSend");
    const multiSend = await MultiSend.deploy();

    await multiSend.waitForDeployment();

    const address = await multiSend.getAddress();
    console.log(`MultiSend deployed to: ${address}`);

    // Wait for block confirmations to ensure verification works
    console.log("Waiting for 6 blocks verification...");
    await multiSend.deploymentTransaction().wait(6);

    console.log("Verifying contract...");
    try {
        await hre.run("verify:verify", {
            address: address,
            constructorArguments: [],
        });
        console.log("Contract verified successfully");
    } catch (error) {
        console.error("Verification failed:", error);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

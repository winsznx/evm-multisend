const hre = require("hardhat");

async function main() {
    console.log("Deploying MultiSend contract...");

    // Get deployer account
    const [deployer] = await hre.ethers.getSigners();
    console.log(`Deploying with account: ${deployer.address}`);

    // Check deployer balance
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log(`Account balance: ${hre.ethers.formatEther(balance)} ETH`);

    // Deploy contract
    const MultiSend = await hre.ethers.getContractFactory("MultiSend");
    const multiSend = await MultiSend.deploy();

    await multiSend.waitForDeployment();

    const address = await multiSend.getAddress();
    console.log(`✅ MultiSend deployed to: ${address}`);

    // Get deployment transaction
    const deployTx = multiSend.deploymentTransaction();
    if (deployTx) {
        console.log(`Transaction hash: ${deployTx.hash}`);
        console.log(`Block number: ${deployTx.blockNumber}`);

        // Wait for confirmations
        const receipt = await deployTx.wait(1);
        console.log(`Gas used: ${receipt.gasUsed.toString()}`);
        console.log(`Effective gas price: ${hre.ethers.formatUnits(receipt.gasPrice, 'gwei')} gwei`);
    }

    // Wait for block confirmations before verification
    console.log("\nWaiting for 6 block confirmations...");
    await multiSend.deploymentTransaction().wait(6);
    console.log("✅ Confirmations complete");

    // Verify contract on block explorer
    console.log("\nVerifying contract on block explorer...");
    try {
        await hre.run("verify:verify", {
            address: address,
            constructorArguments: [],
        });
        console.log("✅ Contract verified successfully");
    } catch (error) {
        if (error.message.includes("Already Verified")) {
            console.log("ℹ️  Contract already verified");
        } else {
            console.error("❌ Verification failed:", error.message);
            console.log("You can verify manually later with:");
            console.log(`npx hardhat verify --network ${hre.network.name} ${address}`);
        }
    }

    // Print deployment summary
    console.log("\n" + "=".repeat(60));
    console.log("DEPLOYMENT SUMMARY");
    console.log("=".repeat(60));
    console.log(`Network: ${hre.network.name}`);
    console.log(`Contract: MultiSend`);
    console.log(`Address: ${address}`);
    console.log(`Deployer: ${deployer.address}`);
    console.log(`Block Explorer: ${getBlockExplorerUrl(hre.network.name, address)}`);
    console.log("=".repeat(60));

    // Save deployment info to file
    const fs = require('fs');
    const deploymentInfo = {
        network: hre.network.name,
        chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
        contract: "MultiSend",
        address: address,
        deployer: deployer.address,
        timestamp: new Date().toISOString(),
        blockNumber: deployTx?.blockNumber,
        transactionHash: deployTx?.hash,
    };

    const deploymentsDir = './deployments';
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir);
    }

    const filename = `${deploymentsDir}/${hre.network.name}-${Date.now()}.json`;
    fs.writeFileSync(filename, JSON.stringify(deploymentInfo, null, 2));
    console.log(`\n📝 Deployment info saved to: ${filename}`);
}

function getBlockExplorerUrl(network, address) {
    const explorers = {
        base: `https://basescan.org/address/${address}`,
        baseSepolia: `https://sepolia.basescan.org/address/${address}`,
        mainnet: `https://etherscan.io/address/${address}`,
        sepolia: `https://sepolia.etherscan.io/address/${address}`,
    };
    return explorers[network] || `https://etherscan.io/address/${address}`;
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

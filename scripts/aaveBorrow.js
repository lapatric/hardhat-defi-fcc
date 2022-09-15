const { getNamedAccounts, ethers } = require("hardhat");
const { getWeth } = require("../scripts/getWeth");

async function main() {
    // the AAVE protocol treats everything as an ERC20 token, so we convert some ETH to WETH to deposit
    await getWeth();
    const { deployer } = await getNamedAccounts();
    // get lending pool contract
    const lendingPool = await getLendingPool(deployer); 
    console.log(`LendingPool address ${lendingPool.address}`);
}

async function getLendingPool(account) {
    // The lendingPoolAddressesProvider is a contract that gives us the correct address of the lending pool contract
    // Get the respective AAVE files (contracts etc.): yarn add --dev @aave/protocol-v2
    const lendingPoolAddressesProvider = await ethers.getContractAt("ILendingPoolAddressesProvider", "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5", account)
    const lendingPoolAddress = await lendingPoolAddressesProvider.getLendingPool();
    const lendingPool = await ethers.getContractAt("ILendingPool", lendingPoolAddress, account);
    return lendingPool;
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
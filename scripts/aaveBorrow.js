const { getNamedAccounts, ethers } = require("hardhat");
const { getWeth, AMOUNT } = require("../scripts/getWeth");

async function main() {
    // the AAVE protocol treats everything as an ERC20 token, so we convert some ETH to WETH to deposit
    await getWeth();
    const { deployer } = await getNamedAccounts();

    // get lending pool contract
    const lendingPool = await getLendingPool(deployer); 
    console.log(`LendingPool address ${lendingPool.address}`);

    const wethTokenAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
    // approve lendingPool contract to take my WETH
    await approveErc20(wethTokenAddress, lendingPool.address, AMOUNT, deployer);
    console.log("Depositing...");
    await lendingPool.deposit(wethTokenAddress, AMOUNT, deployer, 0);
    console.log("Deposited!");
}

async function getLendingPool(account) {
    // The lendingPoolAddressesProvider is a contract that gives us the correct address of the lending pool contract
    // Get the respective AAVE files (contracts etc.): yarn add --dev @aave/protocol-v2
    const lendingPoolAddressesProvider = await ethers.getContractAt("ILendingPoolAddressesProvider", "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5", account)
    const lendingPoolAddress = await lendingPoolAddressesProvider.getLendingPool();
    const lendingPool = await ethers.getContractAt("ILendingPool", lendingPoolAddress, account);
    return lendingPool;
}

async function approveErc20(erc20Address, spenderAddress, amountToSpend, account) {
    const erc20Token = await ethers.getContractAt("IERC20", erc20Address, account);
    const tx = await erc20Token.approve(spenderAddress, amountToSpend);
    await tx.wait(1);
    console.log("Approved!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
const { getNamedAccounts, ethers } = require("hardhat");
const { getWeth, AMOUNT } = require("../scripts/getWeth");

async function main() {
    // the AAVE protocol treats everything as an ERC20 token, so we convert some ETH to WETH to deposit
    await getWeth();
    const { deployer } = await getNamedAccounts();

    // get lending pool contract
    const lendingPool = await getLendingPool(deployer); 
    console.log(`LendingPool address ${lendingPool.address}`);
    
    // approve lendingPool contract to take my WETH
    const wethTokenAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
    await approveErc20(wethTokenAddress, lendingPool.address, AMOUNT, deployer);
    console.log("Depositing...");

    // deposit to lendingPool
    await lendingPool.deposit(wethTokenAddress, AMOUNT, deployer, 0);
    console.log("Deposited!");

    // borrow
    let { availableBorrowsETH , totalDebtETH } = await getBorrowUserData(lendingPool, deployer);
    const daiPrice = await getDaiPrice();
    const amountDaiToBorrow = availableBorrowsETH.toString() * 0.95 * (1 / daiPrice.toNumber()); // we borrow 95% of max
    console.log(`You can borrow ${amountDaiToBorrow} DAI`);
    const amountDaiToBorrowWei = ethers.utils.parseEther(amountDaiToBorrow.toString());
    const daiTokenAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
    await borrowDai(daiTokenAddress, lendingPool, amountDaiToBorrowWei, deployer);
    await getBorrowUserData(lendingPool, deployer); // check our borrowing status again
}

async function borrowDai(daiAddress, lendingPool, amountDaiToBorrowWei, account) {
    const borrowTx = await lendingPool.borrow(daiAddress, amountDaiToBorrowWei, 1, 0, account);
    await borrowTx.wait(1);
    console.log("You've borrowed!");
}

async function getDaiPrice() {
    // no provider needed as we're only reading / not writing
    const daiEthPriceFeed = await ethers.getContractAt("AggregatorV3Interface", "0x773616E4d11A78F511299002da57A0a94577F1f4");
    const price = (await daiEthPriceFeed.latestRoundData())[1];
    console.log(`The DAI/ETH price is ${price.toString()}`);
    return price;
}

async function getBorrowUserData(lendingPool, account) {
    const { totalCollateralETH, totalDebtETH, availableBorrowsETH } = await lendingPool.getUserAccountData(account);
    console.log(`You have ${totalCollateralETH} worth of ETH deposited!`);
    console.log(`You have ${totalDebtETH} worth of ETH borrowed!`);
    console.log(`You have ${availableBorrowsETH} worth of ETH!`);
    return { availableBorrowsETH, totalDebtETH }
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
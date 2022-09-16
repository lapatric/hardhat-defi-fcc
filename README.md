## Borrowing & Lending with AAVE (DeFi)

### 1. Depositing collateral: ETH / WETH

The AAVE protocol treats everything as an ERC20 token. Therefore if we deposit ETH which is the native token of the blockchain and not an ERC20 token, it will automatically be passed through the WETH gateway which converts it to WETH (ERC20 ETH). Alternatively, we can also deposit WETH directly by manually obtaining our WETH first. 

### 2. Borrowing an asset: DAI

Having deposited WETH into the LendingPool, we can now borrow a certain amount of other tokens (DAI in this example). However, the value of the ETH amount we collateralized must at all times be greater than the value of the tokens we borrow (with some margin), i.e. we must remain overcollaterlized. This is to ensure solvency of the AAVE protocol. If we fail to do so, we are at risk of being liquidated by others.

### 3. Repaying the loan: DAI

If we repay the exact amount of tokens we borrowed, we'll notice that we still have some borrowed tokens left. This is because while holding a borrowed position, it accrues interest. This debt remains outstanding unless it is paid off in full, either by passing `uint(-1)` as amount to repay (see [documentation](https://docs.aave.com/developers/v/2.0/the-core-protocol/lendingpool)) or buying some DAI through the Uniswap protocol in order to repay the remainder.


## Forking Mainnet for Testing

You can start an instance of Hardhat Network that forks mainnet. This means that it will simulate having the same state as mainnet, but it will work as a local development network. That way you can interact with deployed protocols and test complex interactions locally. To use this feature you need to connect to an archive node. We recommend using Alchemy. Read more in the [Hardhat Documentation](https://hardhat.org/hardhat-network/docs/guides/forking-other-networks).

**Pros**: Quick, easy, resembles what's on the mainnet (powerful!)
**Cons**: We need an API (e.g. Alchemy), some contracts are complex to work with and may require mocks for optimal testing

Note: Similar to the local Hardhat network, Hardhat provides us with a set of (fake) test wallets and ETH, making it very easy to deploy and test our contracts on the locally forked Mainnet.
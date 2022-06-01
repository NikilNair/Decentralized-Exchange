const { ethers } = require('ethers')
const { abi: IUniswapV3PoolABI } = require('@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json')
const { abi: SwapRouterABI } = require('@uniswap/v3-periphery/artifacts/contracts/interfaces/ISwapRouter.sol/ISwapRouter.json')
const { getPoolImmutables, getPoolState } = require('./helpers')
const ERC20ABI = require('./abi.json')

var BN = require('bignumber.js');

require('dotenv').config()
const INFURA_URL_TESTNET = process.env.INFURA_URL_TESTNET
const WALLET_ADDRESS = process.env.WALLET_ADDRESS
const WALLET_SECRET = process.env.WALLET_SECRET

const provider = new ethers.providers.JsonRpcProvider(INFURA_URL_TESTNET) // Ropsten
const poolAddress = "0x4D7C363DED4B3b4e1F954494d2Bc3955e49699cC"
const swapRouterAddress = "0xE592427A0AEce92De3Edee1F18E0157C05861564"

const name0 = 'Wrapped Ether'
const symbol0 = 'WETH'
const decimals0 = 18
const address0 = "0xc778417E063141139Fce010982780140Aa0cD5Ab"

const name1 = 'Uniswap Token'
const symbol1 = 'UNI'
const decimals1 = 18
const address1 = "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984"

async function main() {
    const poolContract = new ethers.Contract(
        poolAddress,
        IUniswapV3PoolABI,
        provider
    )

    const immutables = await getPoolImmutables(poolContract)
    const state = await getPoolState(poolContract)

    const wallet = new ethers.Wallet(WALLET_SECRET)
    const connectedWallet = wallet.connect(provider)

    const swapRouterContract = new ethers.Contract(
        swapRouterAddress,
        SwapRouterABI,
        provider
    )


    // const testtt = "0.01"
    // const test_amount = ethers.utils.parseUnits(testtt, 18)
    // console.log(test_amount)

    const inputAmount = "0.01"

    const amountIn = ethers.utils.parseUnits(
        inputAmount,
        decimals0
    )
    console.log("Value")
    console.log(amountIn)



    // const amountIn = ethers.BigNumber.from(inputAmount).mul(ethers.BigNumber.from(10).pow(decimals))

    const approvalAmount = (amountIn * 100000).toLocaleString('fullwide', { useGrouping: false }).toString()


    const tokenContract0 = new ethers.Contract(
        address0,
        ERC20ABI,
        provider
    )

    const approvalResponse = await tokenContract0.connect(connectedWallet).approve(
        swapRouterAddress,
        approvalAmount
    )


    const params = {
        tokenIn: immutables.token1,
        tokenOut: immutables.token0,
        fee: immutables.fee,
        recipient: WALLET_ADDRESS,
        deadline: Math.floor(Date.now() / 1000) + (60 * 10),
        amountIn: amountIn,
        amountOutMinimum: 0,
        sqrtPriceLimitX96: 0,
    }

    const transaction = swapRouterContract.connect(connectedWallet).exactInputSingle(
        params,
        {
            gasLimit: ethers.utils.hexlify(1000000)
        }
    ).then(transaction => {
        console.log(transaction)
    })
}


main()

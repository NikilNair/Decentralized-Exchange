import React, { Component } from "react";
import { Form, Container, Grid, Header } from "semantic-ui-react";
import {
  ChainId, Token, WETH, Fetcher, Trade, Route, TokenAmount, TradeType, Percent
} from "@uniswap/sdk";
import { ethers } from 'ethers';
// require('dotenv').config();

const tokenNameOptions = [
  { key: "weth", text: "WETH", value: "weth" },
  { key: "dai", text: "DAI", value: "dai" },
];


class TokenPairForm extends Component {
  state = {
    token1Value: "",
    token1ValueSubmitted: "",
    token1Name: "",
    token1NameSubmitted: "",
    token2Value: "",
    token2ValueSubmitted: "",
    token2Name: "",
    token2NameSubmitted: "",
  };

  handleChange = (e, { name, value }) => this.setState({ [name]: value });

  handleSubmit = async() => {
    const { token1Value, token1Name, token2Value, token2Name } = this.state;
    console.log("function: handle submit");
    // console.log(require('dotenv').config({path: '../../.env'}));

    this.setState({
      token1ValueSubmitted: token1Value,
      token1NameSubmitted: token1Name,
      token2ValueSubmitted: token2Value,
      token2NameSubmitted: token2Name,
    });

    // ABI imports
    const uniswapV2ExchangeAddress = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'; 
    // const daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F'; // mainnet
    const daiAddress = '0xc3dbf84Abb494ce5199D5d4D815b10EC29529ff8';  // rinkeby

    // const url = process.env.URL;
    const url = 'https://rinkeby.infura.io/v3/infura project id';
    console.log("url: " + url);
    const provider = new ethers.providers.JsonRpcProvider(url);
    const chainId = ChainId.RINKEBY;
    const dai = await Fetcher.fetchTokenData(chainId, daiAddress, provider);
    const weth = WETH[chainId];
    const pair = await Fetcher.fetchPairData(dai, weth, provider);
    const route = new Route([pair], weth);

    // swap 0.01 ether
    const tradeAmount = "0.01";
    const trade = new Trade(route, new TokenAmount(weth, ethers.utils.parseEther(tradeAmount)), TradeType.EXACT_INPUT);
    // const trade = new Trade(route, new TokenAmount(weth, ethers.utils.parseEther("0.01")), TradeType.EXACT_INPUT);
    console.log("execution price: $" + trade.executionPrice.toSignificant(6));
    console.log("price impact: " + trade.priceImpact.toSignificant(6) + "%");

    const slippageTolerance = new Percent('50', '10000'); // 0.5%
    const amountOutMin = trade.minimumAmountOut(slippageTolerance).raw;
    const amountOutMinHex = ethers.BigNumber.from(amountOutMin.toString()).toHexString();

    const path = [weth.address, dai.address];
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 mins time
    const inputAmount = trade.inputAmount.raw;
    const inputAmountHex = ethers.BigNumber.from(inputAmount.toString()).toHexString(); 

    // const signer = new ethers.Wallet(process.env.PRIVATE_KEY);
    const signer = new ethers.Wallet("0x");
    const account = signer.connect(provider);

    // declare the DAI contract interfaces
    const daiContract = new ethers.Contract(
      daiAddress,
      ['function balanceOf(address owner) external view returns (uint)',
          'function decimals() external view returns (uint8)'],
      account
    );

    // work out our current balance
    let balance = await daiContract.balanceOf(account.address);
    const decimals = await daiContract.decimals();
    console.log("initial balance: " + ethers.utils.formatUnits(balance.toString(), decimals));

    // declare the Uniswap contract interface
    const uniswap = new ethers.Contract(
      uniswapV2ExchangeAddress,
      ['function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)'],
      account
    );

    const gasPrice = await provider.getGasPrice();

    // do the swap
    const tx = await uniswap.swapExactETHForTokens(
      amountOutMinHex,
      path,
      account.address,
      deadline,
      { 
          value: inputAmountHex, 
          gasPrice: gasPrice.toHexString(),
          gasLimit: ethers.BigNumber.from(500000).toHexString()
      }
    );

    // display the final balance
    balance = await daiContract.balanceOf(account.address);
    console.log("final balance: " + ethers.utils.formatUnits(balance.toString(), decimals));
  };

  render() {
    const {
      token1Value,
      token1ValueSubmitted,
      token1Name,
      token1NameSubmitted,
      token2Value,
      token2ValueSubmitted,
      token2Name,
      token2NameSubmitted,
    } = this.state;

    return (
      <div>
        <Header as="h1">Add Liquidity</Header>
        <Grid>
          <Grid.Row centered>
            <Grid.Column width={5}>
              <Container>
                <Form onSubmit={this.handleSubmit} size="massive">
                  <Form.Group>
                    <Form.Input
                      placeholder="0.0"
                      name="token1Value"
                      value={token1Value}
                      onChange={this.handleChange}
                    />
                    <Form.Select
                      fluid
                      name="token1Name"
                      options={tokenNameOptions}
                      value={token1Name}
                      placeholder="Select Token"
                      onChange={this.handleChange}
                    />
                  </Form.Group>
                  <Form.Group>
                    <Form.Input
                      placeholder="0.0"
                      name="token2Value"
                      value={token2Value}
                      onChange={this.handleChange}
                    />
                    <Form.Select
                      fluid
                      name="token2Name"
                      options={tokenNameOptions}
                      value={token2Name}
                      placeholder="Select Token"
                      onChange={this.handleChange}
                    />
                  </Form.Group>
                  <Form.Button content="Submit" size="massive" />
                </Form>
                <strong>onChange:</strong>
                <pre>
                  {JSON.stringify(
                    { token1Value, token1Name, token2Value, token2Name },
                    null,
                    2
                  )}
                </pre>
                <strong>onSubmit:</strong>
                <pre>
                  {JSON.stringify(
                    {
                      token1ValueSubmitted,
                      token1NameSubmitted,
                      token2ValueSubmitted,
                      token2NameSubmitted,
                    },
                    null,
                    2
                  )}
                </pre>
              </Container>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </div>
    );
  }
}

export default TokenPairForm;

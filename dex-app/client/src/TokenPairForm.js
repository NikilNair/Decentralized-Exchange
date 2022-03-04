import React, { Component } from "react";
import { Form, Container, Grid, Header } from "semantic-ui-react";

const tokenNameOptions = [
  { key: "eth", text: "ETH", value: "eth" },
  { key: "usdc", text: "USDC", value: "usdc" },
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

  handleSubmit = () => {
    const { token1Value, token1Name, token2Value, token2Name } = this.state;

    this.setState({
      token1ValueSubmitted: token1Value,
      token1NameSubmitted: token1Name,
      token2ValueSubmitted: token2Value,
      token2NameSubmitted: token2Name,
    });
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

const etherTransaction = artifacts.require("etherTransaction");

module.exports = function (deployer) {
  deployer.deploy(etherTransaction);
};

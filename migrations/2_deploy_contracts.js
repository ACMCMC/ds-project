const web3 = require("web3");
const Crowdfund = artifacts.require("Crowdfund.sol");

module.exports = function(deployer) {
    deployer.deploy(Crowdfund, web3.utils.toWei("0", "ether"));
};
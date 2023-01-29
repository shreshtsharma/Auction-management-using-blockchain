const auction = artifacts.require('auction');

module.exports = function (deployer) {
  deployer.deploy(auction);
};

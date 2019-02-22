var YamanaToken = artifacts.require("./YamanaToken.sol");
var YamanaTokenSale = artifacts.require("./YamanaTokenSale.sol");

module.exports = function(deployer) {
  deployer.deploy(YamanaToken, 1600000000).then(function() {
    // Token price is 0.000001 Ether
    var tokenPrice = 1000000000000;
    return deployer.deploy(YamanaTokenSale, YamanaToken.address, tokenPrice);
  }).then(function(){
  	var tokensAvailable=360000000
  	YamanaToken.deployed().then(function(instance) { instance.transfer(YamanaTokenSale.address, tokensAvailable, { from: "0xc1c82F96A37D1e59a710828f17A213011fB6ffe8" }); })
  });
};

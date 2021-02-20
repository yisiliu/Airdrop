const Airdrop = artifacts.require("Airdrop");
const { merkleRoot } = require("../test/constants")
module.exports = function(deployer){
    deployer.deploy(
        Airdrop,
        '0x0d9c8723b343a8368bebe0b5e89273ff8d712e3c',
        merkleRoot,
        1614222000,
        1614654000
    );
};

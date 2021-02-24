const Airdrop = artifacts.require("Airdrop")
const BigNumber = require('bignumber.js')
let TestTokenA = artifacts.require('TestTokenA')
const { merkleRoot } = require("../test/constants")

module.exports = function (deployer, _network, accounts) {
    const amount = new BigNumber('1e27').toFixed()
    const creator = accounts[0]
    deployer.deploy(TestTokenA, amount).then(async (token) => {
        await token.transfer.sendTransaction(creator, amount)
        const airDrop = await deployer.deploy(
            Airdrop,
            token.address,
            merkleRoot,
            1614222000,
            1614654000,
            { from: creator }
        )
        await token.approve.sendTransaction(airDrop.address, amount, { from: creator })
        return airDrop
    })
}

const Airdrop = artifacts.require("Airdrop")
const BigNumber = require('bignumber.js')
let TestTokenA = artifacts.require('TestTokenA')
const { merkleRoot } = require("../test/generated")
const { start_time, end_time } = require("../test/constants")

module.exports = function (deployer, _network, accounts) {
    const amount = new BigNumber('1e27').toFixed()
    const creator = accounts[0]
    deployer.deploy(TestTokenA, amount).then(async (token) => {
        const airDrop = await deployer.deploy(
            Airdrop,
            token.address,
            merkleRoot,
            start_time,
            end_time,
            { from: creator }
        )
        await token.transfer.sendTransaction(airDrop.address, amount)
        return airDrop
    })
}

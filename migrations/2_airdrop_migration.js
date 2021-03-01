const Airdrop = artifacts.require("Airdrop")
const BigNumber = require('bignumber.js')
let TestTokenA = artifacts.require('TestTokenA')
const { merkleRoot } = require("../test/generated")
const realData = require("../test/generatedReal")
const { start_time, end_time, token_amount } = require("../test/constants")

module.exports = function (deployer, _network, accounts) {
    const amount = new BigNumber(token_amount).toFixed()
    const creator = accounts[0]
    deployer.deploy(TestTokenA, amount).then(async (token) => {
        const airDrop = await deployer.deploy(
            Airdrop,
            token.address,
            process.env.REAL === 'true' ? realData.merkleRoot : merkleRoot,
            start_time,
            end_time,
            { from: creator }
        )
        await token.transfer.sendTransaction(airDrop.address, amount)
        return airDrop
    })
}

require("@nomiclabs/hardhat-waffle")

const fs = require('fs').promises
const ethers = require('ethers')
const { generate, generateReal } = require('./src/generate')
const { rawData } = require('./src/rawData')

task("test:prepare_data", "Generate data that required by test", async (taskArguments, hre) => {
  /* As hardhat allows to access its runtime environment variables, 
    we don't need to declare the self-generated accounts as a global variable */
  const accounts = await hre.ethers.getSigners()
  const template = generate(accounts.map(x => x.address.toLowerCase()))
  await fs.writeFile('./test/generated.js', template)
  console.log('✨ test/generated.js generated')

  if (process.env.REAL === 'true') {
    const templateReal = generateReal(rawData)
    await fs.writeFile('./test/generatedReal.js', templateReal)
    console.log('✨ test/generatedReal.js generated')
  }
})

/* subtasks help us get rid of another script and
  package json script like `hardhat prepare_data && hardhat test` */
task("test:finally", "Test after data prepared")
  /* pass param from cli: `hardhat test:finally --real true` */
  .addOptionalParam("real", "whether using real data", "false")
  .setAction(async () => {
    await run("test:prepare_data")
    /* but pass param to a built-in task is not convenient, recommend using node's process.env */
    await run("test")
  })

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  networks: {
    hardhat: {
      /* if using ganache + truffle, to handle self-generated accounts,
      you have to write more code to launch server with ganache-core api */
      accounts: [...new Array(300)].map(() => {
        const { privateKey } = ethers.Wallet.createRandom()
        return {
          balance: '0x' + (10 ** 20).toString(16),
          privateKey
        }
      })
    }
  },
  solidity: "0.7.0",
};


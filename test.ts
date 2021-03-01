import { promises as fs } from 'fs'
import ganache from 'ganache-core'
import type { JsonRpcResponse, JsonRpcPayload } from 'ganache-core'
import { exec, ExecException } from 'child_process'
import { generate, generateReal } from './src/generate'
import { rawData } from './src/rawData'
import Web3 from 'web3'

const web3 = new Web3()
const PORT = 8545
const accounts = [...new Array(3000)].map(() => {
  const secretKey = web3.eth.accounts.create().privateKey
  return {
    balance: '0x' + (10 ** 20).toString(16),
    secretKey
  }
})

// Inject real account by passing secretKey
// accounts.push({ secretKey: '...', balance: '0x' + (10 ** 20).toString(16) })

const options = {
  accounts
}
const server = ganache.server(options)
const provider = server.provider

server.listen(PORT, () => {
  console.log(`✨ ganache listening on port ${PORT}...`)

  provider.send({ method: 'eth_accounts' } as JsonRpcPayload, async (err: Error | null, response?: JsonRpcResponse) => {
    if (!response) {
      server.close()
      throw new Error('🚨 no accounts')
    }
    const template = generate(response.result)

    await fs.writeFile('./test/generated.js', template)
    console.log('✨ test/generated.js generated')

    if (process.env.REAL === 'true') {
      const templateReal = generateReal(rawData)
      await fs.writeFile('./test/generatedReal.js', templateReal)
      console.log('✨ test/generatedReal.js generated')
    }

    exec('truffle test', (err: ExecException | null, stdout: string, _stderr: string) => {
      console.log(stdout)
      server.close()
      err ? process.exit(1) : process.exit(0)
    })
  })
})

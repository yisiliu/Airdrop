import { promises as fs } from 'fs'
import ganache from 'ganache-core'
import { JsonRpcResponse, JsonRpcPayload } from 'ganache-core'
import { spawn, ExecException } from 'child_process'
import { generate } from './src/generate'

const PORT = 8545
const options = { accounts: Array(3000).fill({ balance: '0x' + (10 ** 20).toString(16) }) }
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
    await fs.writeFile('./test/constants.js', template)
    console.log('✨ test/constants.js generated')

    spawn('truffle test', (err: ExecException | null, stdout: string, _stderr: string) => {
      console.log(stdout)
      server.close()
      err ? process.exit(1) : process.exit(0)
    })
  })
})

import { promises as fs } from 'fs'
import ganache from 'ganache-core'
import type { JsonRpcResponse, JsonRpcPayload } from 'ganache-core'
import { exec, ExecException } from 'child_process'
import { generate } from './src/generate'

const PORT = 8545
const test_accounts = [
  '0x0bd793ea8334a77b2bfd604dbaedca11ea094306',
  '0xb574F5F1396FDb17c03F441f673e5cCD15BE8251',
  '0x66b57885E8E9D84742faBda0cE6E3496055b012d',
  '0xa75e8c75F193ee0079F6C75CA7fcBE79C40C517f',
  '0x902Df9e56Def1641ce33A83d2FD2ACD41fd4Bc33',
  '0xae77f70FB7Ecb4009eeE0FBcf94D659Eff2F7DC9',
  '0x0d09dC9a840B1b4ea25194998fD90bB50fC2008A',
  '0xFD7A5D91AF554ACD8ED07c7911E8556a7D20D88a'
]
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
    const r = [...response.result]
    test_accounts.forEach(account => {
      r.splice(Math.floor(3000 * Math.random()), 0, account)
    })
    const { template, json } = generate(response.result, r)
    await fs.writeFile('./test/proofs.json', json)
    await fs.writeFile('./test/generated.js', template)
    console.log('✨ test/generated.js generated')

    exec('truffle test', (err: ExecException | null, stdout: string, _stderr: string) => {
      console.log(stdout)
      server.close()
      err ? process.exit(1) : process.exit(0)
    })
  })
})

import { randomHex, soliditySha3 } from 'web3-utils'
import { MerkleTree } from './merkleTree'
import { buf2hex, hex2buf } from './helpers'
import fs from 'fs'

const rawLeaves = [...Array(3000)].map(() => ({
  address: randomHex(20),
  amount: randomHex(32),
}))

const leaves = rawLeaves.map(({ address, amount }, index) => ({
  buf: Buffer.concat([hex2buf(index.toString(16)), hex2buf(address), hex2buf(amount)]),
  address,
  amount,
}))

const tree = new MerkleTree(
  leaves.map((l) => buf2hex(l.buf)),
  (soliditySha3 as unknown) as (...str: string[]) => string,
)

const leavesWithProof = leaves.slice(0, 10).map(({ buf, address, amount }) => ({
  address,
  proof: tree.generateProof(buf2hex(buf)),
  amount,
}))

const constants = JSON.stringify(
  {
    merkleRoot: tree.root,
    leaves: leavesWithProof,
  },
  null,
  2,
)

fs.writeFileSync('test/constants.js', `module.exports = ${constants}`)

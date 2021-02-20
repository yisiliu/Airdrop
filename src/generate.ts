import { randomHex, soliditySha3 } from 'web3-utils'
import Web3 from 'web3'
import { MerkleTree } from './merkleTree'
import { buf2hex, hex2buf } from './helpers'
import fs from 'fs'
import endent from 'endent'
import { rawLeaves } from './csvjson'

const web3 = new Web3()

const leaves = rawLeaves.map((v, i) => {
  return {
    buf: Buffer.concat([
      hex2buf(web3.eth.abi.encodeParameter('uint256', i)),
      hex2buf(v.address),
      hex2buf(web3.eth.abi.encodeParameter('uint256', v.amount)),
    ]),
    ...v,
  }
})

export const tree = new MerkleTree(
  leaves.map((l) => buf2hex(l.buf)),
  (soliditySha3 as unknown) as (...str: string[]) => string,
)

export const leavesWithProof = leaves.slice(0, 10).map((l) => {
  return {
    address: l.address,
    proof: tree.generateProof(buf2hex(l.buf)),
    amount: l.amount,
  }
})

const template =
  endent`
  const merkleRoot = "${tree.root}"
  const leaves = ${JSON.stringify(leavesWithProof, null, 2)}

  module.exports = {
    merkleRoot,
    leaves
  }
` +
  `
`

fs.writeFile('test/constants.js', template, () => {})

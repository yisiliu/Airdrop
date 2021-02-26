import { randomHex, soliditySha3 } from 'web3-utils'
import { MerkleTree } from './merkleTree'
import { buf2hex, hex2buf } from './helpers'
import endent from 'endent'
import Web3 from 'web3'

export function generate(accounts: string[], test_accounts: string[]) {
  const web3 = new Web3()
  const rawLeaves = accounts.map((address) => ({ address, amount: Math.floor(Math.random() * 100000) }))
  const rawTestLeaves = test_accounts.map((address) => ({ address, amount: Math.floor(Math.random() * 100000) }))

  const leaves = rawLeaves.map((v, i) => {
    return {
      index: String(i),
      buf: Buffer.concat([
        hex2buf(web3.eth.abi.encodeParameter('uint256', i)),
        hex2buf(v.address),
        hex2buf(web3.eth.abi.encodeParameter('uint256', v.amount)),
      ]),
      ...v,
    }
  })
  const testLeaves = rawTestLeaves.map((v, i) => {
    return {
      index: String(i),
      buf: Buffer.concat([
        hex2buf(web3.eth.abi.encodeParameter('uint256', i)),
        hex2buf(v.address),
        hex2buf(web3.eth.abi.encodeParameter('uint256', v.amount)),
      ]),
      ...v,
    }
  })

  const tree = new MerkleTree(
    leaves.map((l) => buf2hex(l.buf)),
    (soliditySha3 as unknown) as (...str: string[]) => string,
  )
  const testTree = new MerkleTree(
    testLeaves.map((l) => buf2hex(l.buf)),
    (soliditySha3 as unknown) as (...str: string[]) => string,
  )


  const fullLeavesWithProof = leaves.map((l) => {
    return {
      address: l.address,
      proof: tree.generateProof(buf2hex(l.buf)),
      amount: l.amount,
      index: l.index
    }
  })
  const testFullLeavesWithProof = testLeaves.map((l) => {
    return {
      address: l.address,
      proof: testTree.generateProof(buf2hex(l.buf)),
      amount: l.amount,
      index: l.index
    }
  })

  const offset = leaves.length - 146
  const leavesWithProof = fullLeavesWithProof.slice(offset, offset + 10)

  const merkleRoot = tree.root
  const testMerkleRoot = tree.root

  return {
    json: JSON.stringify({ merkleRoot: testMerkleRoot, leavesWithProof: testFullLeavesWithProof }, null, 2),
    template: 'module.exports = ' + JSON.stringify({ merkleRoot, leavesWithProof }, null, 2)
  }
}

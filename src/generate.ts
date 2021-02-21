import { randomHex, soliditySha3 } from 'web3-utils'
import { MerkleTree } from './merkleTree'
import { buf2hex, hex2buf } from './helpers'
import { helperRawAccounts } from './helperRawAccounts'
import { realData } from './realData'
import fs from 'fs'
import endent from 'endent'
import Web3 from 'web3'
import Bignumber from 'bignumber.js'

const web3 = new Web3()
const ourAccounts = [
  // '0x0bd793ea8334a77b2bfd604dbaedca11ea094306',
  '0xb574F5F1396FDb17c03F441f673e5cCD15BE8251',
  // '0x66b57885E8E9D84742faBda0cE6E3496055b012d',
  '0xa75e8c75F193ee0079F6C75CA7fcBE79C40C517f',
  '0x902Df9e56Def1641ce33A83d2FD2ACD41fd4Bc33',
  // '0xae77f70FB7Ecb4009eeE0FBcf94D659Eff2F7DC9',
]
// const helperAccounts = helperRawAccounts.map((v) => v.address)
// // insert random accounts
// ourAccounts.forEach((v) => {
//   const i = Math.floor((helperAccounts.length - 1) * Math.random())
//   console.log(i)
//   helperAccounts.splice(i, 0, v)
// })

// const rawLeaves = helperRawAccounts.map((v) => ({ address: v.address, amount: Math.floor(Math.random() * 100000) }))
const leaves = realData.map((v, i) => {
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

const offset = 0
export const leavesWithProof = leaves.map((l, i) => {
  return {
    address: l.address,
    proof: tree.generateProof(buf2hex(l.buf)),
    amount: new Bignumber(l.amount).toFixed(),
    index: String(i),
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

const templateJson = JSON.stringify({ merkleRoot: tree.root, leaves: leavesWithProof }, null, 2)

fs.writeFile('test/constants.js', template, () => {})
fs.writeFile('test/constants.json', templateJson, () => {})

const fs = require('fs')
const { soliditySha3 } = require('web3-utils')
const { MerkleTree } = require('./merkleTree')
const { buf2hex, hex2buf } = require('./helpers')
const Web3 = require('web3')

/**
 * @param {string[]} accounts
 * @returns {string}
 */
function generate(accounts) {
  const web3 = new Web3()
  const rawLeaves = accounts.map((address) => ({ address, amount: Math.floor(Math.random() * 100000) }))
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

  const tree = new MerkleTree(
    leaves.map((l) => buf2hex(l.buf)),
    soliditySha3
  )

  const offset = leaves.length - 146
  const leavesWithProof = leaves.slice(offset, offset + 10).map((l) => {
    return {
      address: l.address,
      proof: tree.generateProof(buf2hex(l.buf)),
      amount: l.amount,
      index: l.index
    }
  })
  const merkleRoot = tree.root

  return 'module.exports = ' + JSON.stringify({ merkleRoot, leavesWithProof }, null, 2)
}

/**
 * @param {{ address: string; amount: number }[]} accounts
 * @returns {string}
 */
function generateReal(accounts) {
  const web3 = new Web3()
  const leaves = accounts.map((v, i) => {
    return {
      index: String(i),
      buf: Buffer.concat([
        hex2buf(web3.eth.abi.encodeParameter('uint256', i)),
        hex2buf(v.address),
        hex2buf(web3.eth.abi.encodeParameter('uint256', Number(v.amount.toFixed(0)))),
      ]),
      ...v
    }
  }).slice(0, 100)

  const tree = new MerkleTree(
    leaves.map((l) => buf2hex(l.buf)),
    soliditySha3
  )

  const leavesWithProof = leaves.map((l) => {
    return {
      address: l.address,
      proof: tree.generateProof(buf2hex(l.buf)),
      amount: Number(l.amount.toFixed(0)),
      index: l.index
    }
  })

  const merkleRoot = tree.root

  if (process.env.REAL === 'true') {
    fs.writeFile('data/proofs.json', JSON.stringify({ merkleRoot, leaves: leavesWithProof }, null, 2), () => { })
  }

  return 'module.exports = ' + JSON.stringify({ merkleRoot, leavesWithProof }, null, 2)
}

module.exports = {
  generate,
  generateReal
}
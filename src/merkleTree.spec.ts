import { assert } from 'chai'
import 'mocha'
import { randomHex, soliditySha3 } from 'web3-utils'
import { buf2hex, hex2buf } from './helpers'
import { MerkleTree } from './merkleTree'

describe('merkle-tree', () => {
  it('basic', () => {
    const size = 3000
    const leaves: Buffer[] = []

    for (let i = 0; i < size; i++) {
      leaves.push(Buffer.alloc(1, i))
    }

    const tree = new MerkleTree(leaves.map(buf2hex), (soliditySha3 as unknown) as (...str: string[]) => string)
    const proof = tree.generateProof(buf2hex(leaves[614]))

    assert.equal(tree.root, '0xc223c25fb670c3320db10b5ef2d85bfe2b193693a548800e6af5e872e55f0240')
    assert.deepEqual(proof, [
      '0x9690ad99d6ce244efa8a0f6c2d04036d3b33a9474db32a71b71135c695102793',
      '0xedaaa88579fdee29d6a9bdc21490cacc5a785e67f2deaef2d7322d57f89a9f28',
      '0xc598cb3f729a39d010f0afd6dd2b3224b2b0de0a67554a00947b9b20c95dc7e9',
      '0xa2e4cf01a39de4e12c6ec078320c23cabe9e21cfe2eb77955c31062617faf23b',
      '0x3ba8adc9656ff25469c50be62ae3762a721d9ba04f5e694992377e558c709239',
      '0x2fcd8a8bb235716228f223b19f074b8e6b68ffbd9f5b6c157da382702ded4e51',
      '0xab7d758d190864988b8d72a78a06b2f45febff559f3537a0c707357b6431d73a',
      '0x61334cab3607fdf135acd98031df39ac1e4823e35d4b4dd0cf06bdbf8660bd99',
      '0x54d74460a2b9304002575fdc300adf134e705408a358f480f4d7b8f18ab552c9',
      '0x56931b5f653367cbf0ab4df68b846a4efdd81af25034d11706d94841e691b455',
      '0x34bc3f0eb9f2328f8a17b53c26d25222736cf57af86e56f564a17bf6f794d42e',
      '0x0dda13036580119ae4a94373c74565d45bf38376d18d09c06068fd47fb724729',
    ])
    assert.equal(buf2hex(leaves[614]), '66')
    assert.isTrue(tree.verifyProof(proof, buf2hex(leaves[614])))
  })

  it('address', () => {
    const size = 3000
    const leaves: Buffer[] = []

    for (let i = 0; i < size; i += 1) {
      const address = randomHex(20) // 160 bits
      const amount = randomHex(12) // 96 bits
      leaves.push(Buffer.concat([hex2buf(address), hex2buf(amount)]))
    }

    const tree = new MerkleTree(leaves.map(buf2hex), (soliditySha3 as unknown) as (...str: string[]) => string)
    const proof = tree.generateProof(buf2hex(leaves[614]))

    assert.doesNotThrow(() => tree.root)
    assert.lengthOf(proof, 12)
    assert.isNotEmpty(leaves[614])
    assert.isTrue(tree.verifyProof(proof, buf2hex(leaves[614])))
  })
})

import { assert } from 'chai'
import 'mocha'
import { randomHex, soliditySha3 } from 'web3-utils'
import { buf2hex, hex2buf } from './helpers'
import { MerkleTree } from './merkleTree'

describe('merkle-tree', () => {

  it('address', () => {
    const size = 15949
    const leaves: Buffer[] = []
    const x = 12312;

    for (let i = 0; i < size; i += 1) {
      const address = randomHex(20) // 160 bits
      const amount = randomHex(32) // 256 bits
      leaves.push(Buffer.concat([hex2buf(address), hex2buf(amount)]))
    }

    const tree = new MerkleTree(leaves.map(buf2hex), (soliditySha3 as unknown) as (...str: string[]) => string)
    const proof = tree.generateProof(buf2hex(leaves[x]))

    assert.doesNotThrow(() => tree.root)
    assert.lengthOf(proof, Math.floor(Math.log2(size))+1)
    assert.isNotEmpty(leaves[x])
    assert.isTrue(tree.verifyProof(proof, buf2hex(leaves[x])))
  })
})

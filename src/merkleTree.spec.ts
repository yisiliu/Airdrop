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

    assert.equal(tree.root, '0x5f81c0a697e1f593aea92e02ee1cd557760d17dc86168697667e17bbdfa7993a')
    assert.deepEqual(proof, [
      '0x14bcc435f49d130d189737f9762feb25c44ef5b886bef833e31a702af6be4748',
      '0x4b830e6e29511990cd3318bbebfe107558ea78d4951eb0e1e1090cc77f803b54',
      '0x0ab7865915f98538c365c43f99ff9cdc23924f5573535651d1e310c609ee5cf8',
      '0xd1cfedba9300f19e076741d12227c44ebf6b00c22f5a2fc1c22018208c658b41',
      '0xde54431b7af517f1f4aecd8322de436d90bbed4e5528a585695042a4c13c0aef',
      '0x71479c1d39a4b22ca187b14c245d323cc192a71ed799b84038d6d34a4385b17f',
      '0x0066842e6a6bb949c4e1851d92780123236637670fd075bdeed5b61f58b0352f',
      '0xa70fa82d4551a6a26434ac3d5a287bb03858572479362140f4265f952c0dac76',
      '0xb7fb97e3a01d3fcffd373ab0351c6132dedc6c5c0c4da0f5e0c3fead86e8fc83',
      '0x9dd58da12ba84562ff50b8a3d4c2ab8a85b2144b5948af6972dfb26c9fa6d075',
      '0x37b06af72fa100683634df1c4bb6730ea352f34977eee32614231a9e7d48652a',
      '0x64b6c1cd72cf5c5ac24efb6245f37085e0e0d60dcfa60c481318b2079e80893b',
    ])
    assert.equal(buf2hex(leaves[614]), '0x66')
    assert.isTrue(tree.verifyProof(proof, buf2hex(leaves[614])))
  })

  it('address', () => {
    const size = 15949
    const leaves: Buffer[] = []
    const x = 12312

    for (let i = 0; i < size; i += 1) {
      const address = randomHex(20) // 160 bits
      const amount = randomHex(32) // 256 bits
      leaves.push(Buffer.concat([hex2buf(address), hex2buf(amount)]))
    }

    const tree = new MerkleTree(leaves.map(buf2hex), (soliditySha3 as unknown) as (...str: string[]) => string)
    const proof = tree.generateProof(buf2hex(leaves[x]))

    assert.doesNotThrow(() => tree.root)
    assert.lengthOf(proof, Math.floor(Math.log2(size)) + 1)
    assert.isNotEmpty(leaves[x])
    assert.isTrue(tree.verifyProof(proof, buf2hex(leaves[x])))
  })
})

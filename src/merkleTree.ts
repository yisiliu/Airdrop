import { randomHex, soliditySha3 } from 'web3-utils'
import { buf2hex, hex2buf } from './helpers'

class MerkleTree {
  private layers: string[][] = []

  constructor(private leaves: string[], private algorithm: (...str: string[]) => string) {
    this.build(this.leaves)
  }

  private hash(x: string) {
    return this.algorithm(x)!
  }

  private combine_hash(x?: string, y?: string): string {
    if (x && !y) return x.toString()
    else if (!x && y) return y.toString()
    else if (x && y) return x < y ? this.algorithm(x, y)! : this.algorithm(y, x)!
    else throw new Error('Failed to generate hash without any inputs.')
  }

  /**
   * Get the merkle root
   */
  public get root() {
    const topLayer = this.layers[this.layers.length - 1]
    if (!topLayer) throw new Error('Cannot get root without building a tree.')
    if (topLayer.length !== 1) throw new Error('Invalid tree.')
    return topLayer[0]
  }

  /**
   * Build a new merkle tree with given leaves
   * @param leaves
   */
  private build(leaves: string[]) {
    // delete previous tree
    this.layers.length = 0

    // build the new tree
    this.layers[0] = leaves.map(this.hash.bind(this))
    for (let layer = 0; this.layers[layer].length > 1; layer += 1) {
      this.layers[layer + 1] = this.layers[layer]
        .map((x, i, array) => {
          if (i % 2 == 0) return this.combine_hash(x, array[i + 1])
          return ''
        })
        .filter(Boolean)
    }
  }

  private getNeighbor(index: number, layer: string[]): string {
    return layer[index % 2 === 0 ? index + 1 : index - 1]
  }

  public generateProof(x: string): string[] {
    let index: number = this.layers[0].indexOf(this.hash(x))
    if (index === -1) throw new Error(`Failed to generate proof for ${x}`)
    return this.layers.slice(0, this.layers.length - 1).reduce((accumulator, layer) => {
      const neighbor = this.getNeighbor(index, layer)
      index = ~~(index / 2)
      return [...accumulator, neighbor]
    }, [])
  }

  public verifyProof(proof: string[], target: string): boolean {
    let computed_hash = this.hash(target)
    for (let i = 0; i < proof.length; i++) {
      if (computed_hash <= proof[i]) computed_hash = this.combine_hash(computed_hash, proof[i])
      else computed_hash = this.combine_hash(proof[i], computed_hash)
    }
    return computed_hash === this.root
  }
}

function test_basic() {
  const size = 3000
  const leaves: Buffer[] = []

  for (let i = 0; i < size; i++) {
    leaves.push(Buffer.alloc(1, i))
  }

  const tree = new MerkleTree(leaves.map(buf2hex), (soliditySha3 as unknown) as (...str: string[]) => string)
  const proof = tree.generateProof(buf2hex(leaves[614]))

  console.log(tree.root)
  console.log(proof)
  console.log(buf2hex(leaves[614]))
  console.log(tree.verifyProof(proof, buf2hex(leaves[614])))
}

function test_address() {
  const size = 3000
  const leaves: Buffer[] = []

  for (let i = 0; i < size; i += 1) {
    const address = randomHex(20) // 160 bits
    const amount = randomHex(12) // 96 bits
    leaves.push(Buffer.concat([hex2buf(address), hex2buf(amount)]))
  }

  const tree = new MerkleTree(leaves.map(buf2hex), (soliditySha3 as unknown) as (...str: string[]) => string)
  const proof = tree.generateProof(buf2hex(leaves[614]))

  console.log(tree.root)
  console.log(proof)
  console.log(buf2hex(leaves[614]))
  console.log(tree.verifyProof(proof, buf2hex(leaves[614])))
}

test_basic()
test_address()

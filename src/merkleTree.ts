import { nodeModuleNameResolver } from "typescript";

const Web3 = require('web3')
const sha3 = Web3.utils.soliditySha3;

export default class MerkleTree {

    merkleRoot: Buffer;
    layers: Buffer[][];
    leaves: Buffer[];

    constructor (leaves: Buffer[]) {
        this.merkleRoot = undefined;
        this.layers = [];
        this.leaves = leaves;
    }

    public hash = (x: Buffer) => sha3(x);

    static combine_hash (x: Buffer, y: Buffer):Buffer {
            if(!y) return x;
            else if(!x) return y;
            else return x < y ? sha3(x, y) : sha3(y, x);
        };
    
    public build() {
        let _layer: number = 0;
        let web3 = new Web3();

        this.layers[0] = this.leaves.map(this.hash);
        console.log(this.layers[_layer]);
        while ( this.layers[_layer++].length > 1 ) {
            this.layers[_layer] = this.layers[_layer-1].map(function(x, i, array) {
                if(i % 2 == 0) return MerkleTree.combine_hash(x, array[i+1]);
            }).filter(function(y, i, array) {
                return y != undefined;
            });
            console.log(this.layers[_layer]);
        }
        this.merkleRoot = this.layers[_layer-1][0];
    }

    public generateProof(x: Buffer): Buffer[] {
        let proof: Buffer[] = new Array();
        let index: number = this.layers[0].indexOf(this.hash(x));
        proof = this.layers.reduce((p, layer) => {
            p.push(this.getNeighbor(index, layer));
            index = ~~(index / 2);
            return p;
        }, []);
        return proof;
    }

    private getNeighbor(index: number, layer: Buffer[]): Buffer {
        return layer[index % 2 === 0 ? index + 1 : index - 1];
    }

    public verifyProof(proof: Buffer[], target: Buffer): boolean {
        let computed_hash: Buffer = this.hash(target);
        for (let i = 0; i < proof.length - 1; i++) {
            console.log(computed_hash);
            if (computed_hash <= proof[i]) 
                computed_hash = MerkleTree.combine_hash(computed_hash, proof[i]);
            else 
                computed_hash = MerkleTree.combine_hash(proof[i], computed_hash);
        }
        return computed_hash === this.merkleRoot;
    }
}

const web3 = new Web3();
const AAA = 15;
let addrs: Buffer[] = new Array();
for (let i = 0; i < AAA; i++){
    let addr = web3.eth.accounts.create(i.toString());
    console.log(addr);
    addrs.push(Buffer.alloc(1, addr));
}
if (AAA % 2 != 0) addrs.push(addrs[addrs.length-1]);

let z:Buffer[] = new Array();
for (let i = 0; i < addrs.length; i++) {
    let combined = sha3(addrs[i], i);
    z.push(Buffer.alloc(1, addrs[i]));
}

let a = new MerkleTree(z);
a.build();
let leaf:Buffer = Buffer.alloc(1, sha3(addrs[0], 0));
let proof = a.generateProof(leaf)
console.log(addrs);
console.log(proof);
console.log(a.verifyProof(proof, leaf));

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


let z = [Buffer.alloc(1, "1"), Buffer.alloc(1, "2"), Buffer.alloc(1, "3"), Buffer.alloc(1, "4"), Buffer.alloc(1, "5")];
let a = new MerkleTree(z);
a.build();
let proof = a.generateProof(z[0])
console.log(proof);
console.log(a.verifyProof(proof, z[0]));

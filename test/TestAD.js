const BigNumber = require('bignumber.js')
const chai = require('chai')
const expect = chai.expect
chai.use(require('chai-as-promised'))
const { leavesWithProof, merkleRoot } = require("./generated")
const generatedReal = require("./generatedReal")

const {
  start_time,
  end_time,
  root_changed_encode,
  root_changed_types,
  claimed_encode,
  claimed_types,
  withdrawed_encode,
  withdrawed_types,
  token_amount
} = require("./constants")
const {
  getEventLogs,
  takeSnapshot,
  revertToSnapShot,
  advanceTimeWithLog,
  getRevertMsg
} = require("./utils")
const { ethers } = require('hardhat')

let snapShot
let snapshotId
let testTokenADeployed
let airdropDeployed
let creator

const amount = new BigNumber(token_amount).toFixed()
describe("AirDrop", (taskArguments) => {
  before(async () => {
    const signers = await ethers.getSigners()
    creator = signers[0]
    const TestTokenA = await ethers.getContractFactory("TestTokenA")
    const testTokenA = await TestTokenA.deploy(amount)
    testTokenADeployed = await testTokenA.deployed()
    const Airdrop = await ethers.getContractFactory("Airdrop", creator)
    const airdrop = await Airdrop.deploy(
      testTokenADeployed.address,
      process.env.REAL === 'true' ? generatedReal.merkleRoot : merkleRoot,
      start_time,
      end_time,
    )
    airdropDeployed = await airdrop.deployed()
    await testTokenADeployed.transfer(airdropDeployed.address, amount)
  })

  beforeEach(async () => {
    snapshotId = await takeSnapshot()
  })

  afterEach(async () => {
    await revertToSnapShot(snapshotId)
  })

  if (process.env.REAL === 'true') {
    describe('check() for real', () => {
      it('should verify root successful with proof generated by typescript', async () => {
        await check_for_real(true)
      })

      async function check_for_real(isAvailable, shrinkRate = 1) {
        for (let i = 0; i < generatedReal.leavesWithProof.length; i++) {
          const leaf = generatedReal.leavesWithProof[i]
          const v = await airdropDeployed.check(leaf.index, leaf.address, leaf.amount, leaf.proof)
          expect(v.available).to.be.eq(isAvailable)
          expect(v.start.toString()).to.be.eq(start_time.toString())
          expect(v.end.toString()).to.be.eq(end_time.toString())
          if (!isAvailable) {
            expect(v.claimable.toString()).to.be.eq('0')
          } else {
            expect(v.claimable.toString()).to.be.eq((Math.ceil(leaf.amount * shrinkRate)).toString())
          }
        }
      }
    })
  } else {
    describe('check()', async () => {
      it('should verify root successful with proof generated by typescript', async () => {
        await check(true)
      })

      it('should failure to verify root after set an unmatched root', async () => {
        const fakeRoot = '0xe4a6109e00d53b509bac49787d00c85d41ca682e297d029647c8c45db8f8c36f'
        await airdropDeployed.set_root(fakeRoot)
        const log = await getEventLogs(airdropDeployed.address, root_changed_encode, root_changed_types)
        expect(log).to.have.property('previous').that.to.be.eq(merkleRoot)
        expect(log).to.have.property('now').that.to.be.eq(fakeRoot)
        await check(false)
        await airdropDeployed.set_root(merkleRoot)
        await check(true)
      })

      it('should not decrease the amount less than one day', async () => {
        const currentBlockTimestamp = await advanceTimeWithLog(86400 * 9 / 10)
        expect(currentBlockTimestamp - start_time).to.be.lessThan(86400)
        await check(true, 1)
      })

      it('should decrease the amount by 20% when one day after start_time', async () => {
        const currentBlockTimestamp = await advanceTimeWithLog(86400 * 10 / 10)
        expect(currentBlockTimestamp - start_time).to.be.lessThan(86400 * 2)
        await check(true, 0.8)
      })

      it('should decrease the amount by 20% after one day after start_time', async () => {
        const currentBlockTimestamp = await advanceTimeWithLog(86400 * 11 / 10)
        expect(currentBlockTimestamp - start_time).to.be.lessThan(86400 * 2).and.to.be.greaterThan(86400)
        await check(true, 0.8)
      })

      it('should decrease the amount by 40% after two days after start_time', async () => {
        const currentBlockTimestamp = await advanceTimeWithLog(86400 * 21 / 10)
        expect(currentBlockTimestamp - start_time).to.be.lessThan(86400 * 3).and.to.be.greaterThan(86400 * 2)
        await check(true, 0.6)
      })

      it('should decrease the amount by 60% after three days after start_time', async () => {
        const currentBlockTimestamp = await advanceTimeWithLog(86400 * 31 / 10)
        expect(currentBlockTimestamp - start_time).to.be.lessThan(86400 * 4).and.to.be.greaterThan(86400 * 3)
        await check(true, 0.4)
      })

      it('should decrease the amount by 80% after four days after start_time', async () => {
        const currentBlockTimestamp = await advanceTimeWithLog(86400 * 41 / 10)
        expect(currentBlockTimestamp - start_time).to.be.lessThan(86400 * 5).and.to.be.greaterThan(86400 * 4)
        await check(true, 0.2)
      })

      it('should decrease the amount by 100% after five days after start_time', async () => {
        const currentBlockTimestamp = await advanceTimeWithLog(86400 * 51 / 10)
        expect(currentBlockTimestamp - start_time).to.be.lessThan(86400 * 6).and.to.be.greaterThan(86400 * 5)
        await check(true, 0)
      })

      it('should decrease the amount by 100% after six days after start_time', async () => {
        const currentBlockTimestamp = await advanceTimeWithLog(86400 * 61 / 10)
        expect(currentBlockTimestamp - start_time).to.be.lessThan(86400 * 7).and.to.be.greaterThan(86400 * 6)
        await check(true, 0)
      })

      async function check(isAvailable, shrinkRate = 1) {
        for (let i = 0; i < leavesWithProof.length; i++) {
          const leaf = leavesWithProof[i]
          const v = await airdropDeployed.check(leaf.index, leaf.address, leaf.amount, leaf.proof)
          expect(v.available).to.be.eq(isAvailable)
          expect(v.start.toString()).to.be.eq(start_time.toString())
          expect(v.end.toString()).to.be.eq(end_time.toString())
          if (!isAvailable) {
            expect(v.claimable.toString()).to.be.eq('0')
          } else {
            expect(v.claimable.toString()).to.be.eq((Math.ceil(leaf.amount * shrinkRate)).toString())
          }
        }
      }
    })

    describe('claim()', async () => {
      it('should failure to claim when Not Started', async () => {
        await claimFail('Not Started')
      })

      it('should failure to claim when Expired', async () => {
        await advanceTimeWithLog(86400 * 100 / 10)
        await claimFail('Expired')
      })

      it('should failure to claim when Not Verified', async () => {
        await advanceTimeWithLog(86400 * 5 / 10)
        await claimFail('Not Verified')
      })

      it('should failure to claim when Already Claimed', async () => {
        await advanceTimeWithLog(86400 * 5 / 10)
        const leaf = leavesWithProof[0]
        const signer = await ethers.getSigner(leaf.address)
        airdropDeployed = airdropDeployed.connect(signer)
        await airdropDeployed.claim(leaf.index, leaf.amount, leaf.proof)
        await expect(
          airdropDeployed.claim(leaf.index, leaf.amount, leaf.proof)
        ).to.be.rejectedWith(getRevertMsg('Already Claimed'))
      })

      it('should claim 100% amount within one day', async () => {
        await advanceTimeWithLog(86400 * 5 / 10)
        await claim()
      })

      it('should claim 80% amount after one day', async () => {
        await advanceTimeWithLog(86400 * 11 / 10)
        await claim(0.8)
      })

      it('should claim 60% amount after two days', async () => {
        await advanceTimeWithLog(86400 * 21 / 10)
        await claim(0.6)
      })

      it('should claim 40% amount after three days', async () => {
        await advanceTimeWithLog(86400 * 31 / 10)
        await claim(0.4)
      })

      it('should claim 20% amount after four days', async () => {
        await advanceTimeWithLog(86400 * 41 / 10)
        await claim(0.2)
      })

      it('should failure to claim when expired after five days', async () => {
        await advanceTimeWithLog(86400 * 51 / 10)
        await claimFail('Expired')
      })

      it('should failure to claim when expired after six days', async () => {
        await advanceTimeWithLog(86400 * 61 / 10)
        await claimFail('Expired')
      })

      async function claimFail(reason) {
        for (let i = 0; i < leavesWithProof.length; i++) {
          const leaf = leavesWithProof[i]
          const signer = await ethers.getSigner(leaf.address)
          airdropDeployed = airdropDeployed.connect(signer)
          await expect(
            airdropDeployed.claim(
              leaf.index,
              reason === 'Not Verified' ? (Number(leaf.amount) + 1).toString() : leaf.amount,
              leaf.proof
            )
          ).to.be.rejectedWith(getRevertMsg(reason))
        }
      }
    })

    describe('withdraw()', async () => {
      it('should fail when not called by contract creator', async () => {
        const leaf = leavesWithProof[2]
        const signer = await ethers.getSigner(leaf.address)
        airdropDeployed = airdropDeployed.connect(signer)
        await expect(
          airdropDeployed.withdraw()
        ).to.be.rejectedWith(getRevertMsg('Not Authorized'))
      })

      it('should fail when not Not Expired', async () => {
        airdropDeployed = airdropDeployed.connect(creator)
        await expect(
          airdropDeployed.withdraw()
        ).to.be.rejectedWith(getRevertMsg('Not Expired'))
      })

      it('should withdraw successful after Expired', async () => {
        await advanceTimeWithLog(86400 * 5 / 10)
        const claimed_amount = BigNumber(await claim()).times(10 ** 18)
        await advanceTimeWithLog(86400 * 100)
        airdropDeployed = airdropDeployed.connect(creator)
        await airdropDeployed.withdraw()
        const log = await getEventLogs(airdropDeployed.address, withdrawed_encode, withdrawed_types)
        expect(log).to.have.property('left').that.to.be.eq(
          BigNumber(token_amount).minus(claimed_amount).toFixed()
        )
        console.log(`     🐦 withdrawed amount: ${log.left}`)
        console.log(`     🐦 claimed amount: ${claimed_amount.toFixed()}`)
      })
    })
  }

  async function claim(shrinkRate = 1) {
    let claimed_amount = 0
    for (let i = 0; i < leavesWithProof.length; i++) {
      const leaf = leavesWithProof[i]
      const signer = await ethers.getSigner(leaf.address)
      airdropDeployed = airdropDeployed.connect(signer)
      await airdropDeployed.claim(leaf.index, leaf.amount, leaf.proof)
      const balance = await testTokenADeployed.balanceOf(leaf.address)
      claimed_amount += leaf.amount * shrinkRate
      expect(BigNumber(balance.toString()).div(1e18).toFixed(2)).to.be.eq(
        (leaf.amount * shrinkRate).toFixed(2)
      )
    }
    const logs = await getEventLogs(airdropDeployed.address, claimed_encode, claimed_types, leavesWithProof.length)
    logs.forEach(async (log, i) => {
      const leaf = leavesWithProof[i]
      expect(BigNumber(log.amount.toString()).div(1e18).toFixed(2)).to.be.eq(
        (leaf.amount * shrinkRate).toFixed(2)
      )
    })
    return claimed_amount
  }
})

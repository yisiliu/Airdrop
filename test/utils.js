const { start_time } = require('./constants')

const abiCoder = new ethers.utils.AbiCoder()
async function getEventLogs(address, encode, type, n = 1) {
  const latestBlockNumber = await ethers.provider.getBlockNumber()
  const fromBlockNumber = latestBlockNumber - n
  // await logBlockTimestamp(fromBlockNumber)
  // await logBlockTimestamp(latestBlockNumber)
  const ralLogs = await ethers.provider.getLogs({
    address,
    topic: [ethers.utils.keccak256(ethers.utils.toUtf8Bytes(encode))],
    fromBlock: fromBlockNumber,
    toBlock: latestBlockNumber,
  })
  const logs = ralLogs.map(log => abiCoder.decode(type, log.data))
  return logs.length === 1 ? logs[0] : logs
}

async function logBlockTimestamp(blockNumber, debug = false) {
  const block = await ethers.provider.getBlock()
  const t = Number(block.timestamp)
  if (debug) {
    console.log(`      🐦 Block#${blockNumber} timestamp: ${t} ${new Date(t * 1000)}`)
  }
  return t
}

async function logLatestBlockTimestamp() {
  const blockNumber = await ethers.provider.getBlockNumber()
  const t = await logBlockTimestamp(blockNumber)
  return t
}

async function advanceTimeWithLog(time) {
  const latestBlockTimestamp = await logLatestBlockTimestamp()
  await advanceTimeAndBlock(time + (start_time - latestBlockTimestamp))
  return await logLatestBlockTimestamp()
}

function getRevertMsg(msg) {
  return `VM Exception while processing transaction: revert ${msg}`
}

async function advanceTime(time) {
  await network.provider.send('evm_increaseTime', [time])
}

async function advanceBlock() {
  await network.provider.send('evm_mine', [])
}

async function takeSnapshot() {
  return network.provider.send('evm_snapshot', [])
}

async function revertToSnapShot(id) {
  await network.provider.send('evm_revert', [id])
}

async function advanceTimeAndBlock(time) {
  await advanceTime(time)
  await advanceBlock()
  return Promise.resolve(ethers.provider.getBlock())
}

module.exports = {
  getEventLogs,
  getRevertMsg,
  logLatestBlockTimestamp,
  advanceTimeWithLog,
  advanceTime,
  advanceBlock,
  advanceTimeAndBlock,
  takeSnapshot,
  revertToSnapShot,
}

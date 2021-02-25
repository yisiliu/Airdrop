async function getEventLogs(address, encode, type, n = 1) {
  const latestBlockNumber = await web3.eth.getBlockNumber()
  const fromBlockNumber = latestBlockNumber - n
  // await logBlockTimestamp(fromBlockNumber)
  // await logBlockTimestamp(latestBlockNumber)
  const ralLogs = await web3.eth.getPastLogs({
    address,
    topic: [web3.utils.sha3(encode)],
    fromBlock: fromBlockNumber,
    toBlock: latestBlockNumber,
  })
  const logs = ralLogs.map(log => web3.eth.abi.decodeParameters(type, log.data))
  return logs.length === 1 ? logs[0] : logs
}

async function logBlockTimestamp(blockNumber) {
  const block = await web3.eth.getBlock(blockNumber)
  const t = Number(block.timestamp)
  console.log(`      🐦 Block#${blockNumber} timestamp: ${t} ${new Date(t * 1000)}`)
  return t
}

async function logLatestBlockTimestamp() {
  const blockNumber = await web3.eth.getBlockNumber()
  const t = await logBlockTimestamp(blockNumber)
  return t
}

function advanceTime(time) {
  return new Promise((resolve, reject) => {
    web3.currentProvider.send(
      {
        jsonrpc: '2.0',
        method: 'evm_increaseTime',
        params: [time],
        id: new Date().getTime(),
      },
      (err, result) => {
        if (err) {
          return reject(err)
        }
        return resolve(result)
      },
    )
  })
}

function advanceBlock() {
  return new Promise((resolve, reject) => {
    web3.currentProvider.send(
      {
        jsonrpc: '2.0',
        method: 'evm_mine',
        id: new Date().getTime(),
      },
      (err, result) => {
        if (err) {
          return reject(err)
        }
        const newBlockHash = web3.eth.getBlock('latest').hash

        return resolve(newBlockHash)
      },
    )
  })
}

function takeSnapshot() {
  return new Promise((resolve, reject) => {
    web3.currentProvider.send(
      {
        jsonrpc: '2.0',
        method: 'evm_snapshot',
        id: new Date().getTime(),
      },
      (err, snapshotId) => {
        if (err) {
          return reject(err)
        }
        return resolve(snapshotId)
      },
    )
  })
}

function revertToSnapShot(id) {
  return new Promise((resolve, reject) => {
    web3.currentProvider.send(
      {
        jsonrpc: '2.0',
        method: 'evm_revert',
        params: [id],
        id: new Date().getTime(),
      },
      (err, result) => {
        if (err) {
          return reject(err)
        }
        return resolve(result)
      },
    )
  })
}

async function advanceTimeAndBlock(time) {
  await advanceTime(time)
  await advanceBlock()
  return Promise.resolve(web3.eth.getBlock('latest'))
}

module.exports = {
  getEventLogs,
  logLatestBlockTimestamp,
  advanceTime,
  advanceBlock,
  advanceTimeAndBlock,
  takeSnapshot,
  revertToSnapShot,
}

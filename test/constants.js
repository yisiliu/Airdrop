const now = Math.floor(new Date().getTime() / 1000)
module.exports = {
  token_amount: 1e27,
  // one day after now
  start_time: now + 86400,
  // five days after start time
  end_time: now + 86400 * 6,
  root_changed_encode: 'RootChanged(bytes32,bytes32)',
  root_changed_types: [
    { type: 'bytes32', name: 'previous' },
    { type: 'bytes32', name: 'now' },
  ],
  claimed_encode: 'Claimed(uint256, uint256)',
  claimed_types: [
    { type: 'uint256', name: 'amount' },
    { type: 'uint256', name: 'timestamp' },
  ],
  withdrawed_encode: 'Withdrawed(uint256, uint256)',
  withdrawed_types: [
    { type: 'uint256', name: 'left' },
    { type: 'uint256', name: 'timestamp' },
  ]
}

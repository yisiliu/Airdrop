module.exports = {
  token_amount: 1e27,
  // Fri Feb 28 2021 11:00:00 GMT+0800 (China Standard Time)
  start_time: 1614481200,
  // Fri Mar 07 2021 11:00:00 GMT+0800 (China Standard Time)
  end_time: 1615086000,
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

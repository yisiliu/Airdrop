module.exports = {
  /**
   * @param {Buffer} b
   */
  buf2hex: (b) => '0x' + b.toString('hex'),
  /**
   * @param {string} h
   */
  hex2buf: (h) => Buffer.from(h.replace(/^0x/i, ''), 'hex')
}

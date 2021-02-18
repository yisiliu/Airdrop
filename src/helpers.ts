export function buf2hex(b: Buffer) {
  return b.toString('hex')
}

export function hex2buf(h: string) {
  return Buffer.from(h.replace(/^0x/i, ''), 'hex')
}

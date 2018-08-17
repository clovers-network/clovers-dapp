import BigNumber from 'bignumber.js'
import utils from 'web3-utils'

const apiBase = process.env.VUE_APP_API_URL

export function pad0x (string) {
  if (typeof string !== 'string') return null
  if (string.startsWith('0x')) return string
  return `0x${string}`
}

export function addrToUser (allUsers, address) {
  let userIndex = allUsers.findIndex(
    u => u.address.toLowerCase() === address.toLowerCase()
  )
  return userIndex > -1 ? allUsers[userIndex].name || address : address
}

export function cloverImage ({ board, byteBoard }, size = 200) {
  if (byteBoard) {
    board = byteBoard
  }
  return `${apiBase}/clovers/svg/${board}/${size}`
}

export function pluralize (word, count) {
  return `${word}${count !== 1 ? 's' : ''}`
}

export function cloverLink ({ board, byteBoard }) {
  if (byteBoard) {
    board = byteBoard
  }
  return `/clovers/${board}`
}

export function prettyBigNumber (bigNumber = 0, decimalPlaces = 2) {
  bigNumber = utils.fromWei(bigNumber.toString(10))
  if (typeof bigNumber !== 'object') bigNumber = new BigNumber(bigNumber)
  return bigNumber.toFormat(decimalPlaces)
}

export function bnMinus (one = 0, two = 0) {
  return new BigNumber(one).minus(new BigNumber(two))
}

export function formatClover (clover) {
  clover.price = clover.price && new BigNumber(clover.price)
  return clover
}

export function padRight (val, number) {
  let diff = parseInt(number) - val.length
  if (diff === 0) return val
  return val.toString() + '0'.repeat(diff)
}

export function makeBn (v = 0) {
  if (typeof v === 'object') return v
  return new BigNumber(v)
}

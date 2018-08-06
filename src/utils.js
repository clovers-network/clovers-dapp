import BigNumber from 'bignumber.js'
import utils from 'web3-utils'

const apiBase = process.env.VUE_APP_API_URL

export function pad0x (string) {
  if (typeof string !== 'string') return null
  if (string.startsWith('0x')) return string
  return `0x${string}`
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
  bigNumber = utils.fromWei(bigNumber.toString())
  if (typeof bigNumber !== 'object') bigNumber = new BigNumber(bigNumber)
  return bigNumber.toFormat(decimalPlaces)
}

export function bnMinus (one = 0, two = 0, float = 0) {
  one = new BigNumber(one)
  two = new BigNumber(two)
  return prettyBigNumber(one.minus(two), float)
}

export function formatClover (clover) {
  clover.price = new BigNumber(clover.price)
  return clover
}

export function makeBn (v = 0) {
  return new BigNumber(v)
}

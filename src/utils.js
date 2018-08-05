import BigNumber from 'bignumber.js'
import utils from 'web3-utils'

const apiBase = process.env.VUE_APP_API_URL

export function pad0x (string) {
  if (typeof string !== 'string') return null
  if (string.startsWith('0x')) return string
  return `0x${string}`
}

export function cloverImage ({ board }, size = 200) {
  return `${apiBase}/clovers/svg/${board}/${size}`
}

export function pluralize (word, count) {
  return `${word}${count !== 1 ? 's' : ''}`
}

export function cloverLink ({ board }) {
  return `/clovers/${board}`
}

export function prettyBigNumber (bigNumber, decimalPlaces = 2) {
  bigNumber = utils.fromWei(bigNumber.toString())
  if (typeof bigNumber !== 'object') bigNumber = new BigNumber(bigNumber)
  return bigNumber.toFormat(decimalPlaces)
}

export function formatClover (clover) {
  clover.price = new BigNumber(clover.price)
  return clover
}

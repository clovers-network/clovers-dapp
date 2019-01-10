import BigNumber from 'bignumber.js'
import utils from 'web3-utils'
import store from './store'

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
  return userIndex > -1 && (allUsers[userIndex].name || (() => {
    if (typeof allUsers[userIndex].ens === 'undefined') {
      store.dispatch('updateUserENS', allUsers[userIndex])
    } else if (allUsers[userIndex].ens !== false) {
      return allUsers[userIndex].ens
    }
    return address
  })())
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

export function cloverIsMonochrome (clover) {
  const isMono = (clvr, colorKey) => {
    if (!clvr || !clvr.rowBoard || !clvr.rowBoard.length) return false
    return clvr.rowBoard.filter(row => row.filter(tile => tile === clvr[colorKey]).length === 8).length === 8
  }
  return isMono(clover, 'WHITE') || isMono(clover, 'BLACK')
}

export function abbrvAddr (addr) {
  // Function to abbreviate 0x addresses
  return addr.substr(0, 6) + addr.slice(-4)
}

export function getUsername (user) {
  if (!user || !user.address) return null
  const addr = user.address.toLowerCase()
  if (addr === store.getters.cloversBankAddress) return 'Clovers'
  if (addr === store.getters.curationMarketAddress) return 'Curation Mrkt.'
  return user && user.name && user.name !== '' ? user.name : null
}

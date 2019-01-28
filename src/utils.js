import BigNumber from 'bignumber.js'
import utils from 'web3-utils'
import store from './store'

const apiBase = process.env.VUE_APP_API_URL

export function pad0x (string) {
  if (typeof string !== 'string') return null
  if (string.startsWith('0x')) return string
  return `0x${string}`
}

export function addrToUser (address) {
  /*
  * @return {string} Username or ENS name or 0x addr
  * --- PROBABLY DONT USE ON LIST VIEWS !!!! ---- (use getUsername)
  */
  const allUsers = store.state.allUsers
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

export function getUsername (addr = '') {
  /**
  * Lighter function than addrToUser (doesn't call ENS system)
  * @return {(string|undefined)} Username, ENS name, undefined
  **/
  addr = addr.toLowerCase()
  const user = store.state.allUsers.filter(user => user.address.toLowerCase() === addr)[0]
  return addr === store.getters.cloversBankAddress ? 'Clovers'
    : addr === store.getters.curationMarketAddress ? 'Curation Mrkt.'
      : user.name && user.name.trim() !== '' ? user.name
        : user.ens ? user.ens
          : undefined
}

export function cloverImage (clover, size = 200) {
  let board = clover.byteBoard || clover.board || clover
  return `${apiBase}/clovers/svg/${board}/${size}`
}

export function pluralize (word, count) {
  return `${word}${count !== 1 ? 's' : ''}`
}

export function cloverLink (clover) {
  let board = clover.byteBoard || clover.board || clover
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

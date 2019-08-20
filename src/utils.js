import BigNumber from 'bignumber.js'
import utils from 'web3-utils'
import store from './store'

// this apiBase doesn't matter which network
const imgBase = 'https://img.clovers.network'
const apiBase = process.env.VUE_APP_API_URL
const cloudinaryBase = process.env.VUE_APP_CLOUDINARY_BASE_URL

export function pad0x (string) {
  if (typeof string !== 'string') return null
  if (string.startsWith('0x')) return string
  return `0x${string}`
}

export function toDec (num, len = 2) {
  num = num.toString(10)
  let foo = num.split('.')
  if (foo.length === 1) return foo.join('.')
  foo[1] = foo[1].substr(0, len)
  return foo.join('.')
}

export function isHex (foobar) {
  var re = /^[0-9A-Fa-f]+$/
  return re.test(foobar.replace('0x', ''))
}

export function cloverImage (clover = '0', size = 200) {
  let board = clover.byteBoard || clover.board || clover
  return `${imgBase}/svg/${encodeURIComponent(board)}/${size}`
}

export function fetchCloudImage (src, transforms = 'f_png') {
  return `${cloudinaryBase}/image/fetch/${transforms}/${src}`
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

export function padRight (val, number, base = 16) {
  let diff = parseInt(number) - val.length
  if (diff === 0) return val
  return val.toString(base) + '0'.repeat(diff)
}

export function makeBn (v = 0) {
  if (typeof v === 'object') return v
  return new BigNumber(v.toString(10))
}

export function cloverIsMonochrome (clover) {
  const isMono = (clvr, colorKey) => {
    if (!clvr || !clvr.rowBoard || !clvr.rowBoard.length) return false
    return clvr.rowBoard.filter(row => row.filter(tile => tile === clvr[colorKey]).length === 8).length === 8
  }
  return isMono(clover, 'WHITE') || isMono(clover, 'BLACK')
}

export function abbrvAddr (addr) {
  return addr.substr(0, 6) + '..' + addr.slice(-4)
}

export function cleanObj (o) {
  for (let n in o) {
    if ((o[n] === null || o[n] === undefined) ||
        typeof o[n] === 'number' && o[n] === 1 ||
        typeof o[n] === 'boolean' && !o[n]) {
      delete o[n]
    }
  }
}

export function abbrvNum (n, decimals = 2) {
  const args = [undefined, { maximumFractionDigits: decimals }]
  if (typeof n === 'number') {
    return parseFloat(n.toFixed(decimals)).toLocaleString(...args)
  } if (typeof n === 'string') {
    const f = parseFloat(n)
    return f ? parseFloat(f.toFixed(decimals)).toLocaleString(...args) : n
  } else {
    return n
  }
}

// from prettyBigNumber (string,)
export function concatPrice (value) {
  const suffixes = ['', 'K', 'M', 'B', 'T', 'P', 'E', 'Z', 'Y']

  let newValue = typeof value === 'string'
    ? parseFloat(value.split(',').join(''))
    : value
  let suffixNum = 0
  while (newValue >= 1000) {
    newValue /= 1000
    suffixNum++
  }

  newValue = parseFloat(newValue.toPrecision(3))

  newValue += suffixes[suffixNum]
  return newValue
}

export function formatFoundClover (clover) {
  return {
    board: pad0x(clover.byteBoard),
    movesString: clover.movesString,
    symmetrical: clover.symmetrical,
    X0Sym: clover.X0Sym,
    XYSym: clover.XYSym,
    XnYSym: clover.XnYSym,
    Y0Sym: clover.Y0Sym,
    RotSym: clover.RotSym,
    createdAt: new Date()
  }
}

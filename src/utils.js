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

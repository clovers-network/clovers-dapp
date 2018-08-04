const apiBase = process.env.VUE_APP_API_URL

export function pad0x (string) {
  if (typeof string !== 'string') return null
  if (string.startsWith('0x')) return string
  return `0x${string}`
}

export function cloverImage ({ board }) {
  return `${apiBase}/clovers/svg/${board}/200`
}

export function pluralize (word, count) {
  return `${word}${count !== 1 ? 's' : ''}`
}

export function pad0x (string) {
  if (typeof string !== 'string') return null
  if (string.startsWith('0x')) return string
  return `0x${string}`
}

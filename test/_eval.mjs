import WS from 'ws'
const WebSocket = WS.WebSocket || WS
const v = await (await fetch('http://127.0.0.1:9222/json/version')).json()
const ws = new WebSocket(v.webSocketDebuggerUrl, { maxPayload: 1 << 28 })
await new Promise(r => ws.once('open', r))
let id = 0; const pending = new Map()
ws.on('message', raw => { const m = JSON.parse(raw); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id) } })
const send = (method, params = {}, sessionId) => new Promise((res, rej) => {
  const i = ++id; pending.set(i, m => m.error ? rej(new Error(m.error.message)) : res(m.result))
  ws.send(JSON.stringify({ id: i, method, params, ...(sessionId ? { sessionId } : {}) }))
})
const { targetId } = await send('Target.createTarget', { url: process.argv[2] })
const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true })
await send('Runtime.enable', {}, sessionId)
await new Promise(r => setTimeout(r, Number(process.argv[4] || 12) * 1000))
const { result } = await send('Runtime.evaluate', { expression: process.argv[3], returnByValue: true, awaitPromise: true }, sessionId)
console.log(typeof result.value === 'string' ? result.value : JSON.stringify(result.value, null, 1))
await send('Target.closeTarget', { targetId }); ws.close()

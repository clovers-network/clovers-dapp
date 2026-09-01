/**
 * Load the dapp in a real browser and report what actually happens.
 *
 * Drives Chrome over the DevTools Protocol on :9222 rather than a headless
 * library, so it is the same browser a person would use. Reports console
 * errors, failed requests, unhandled rejections, and a summary of what the page
 * rendered -- which is the part a curl-based check cannot see.
 *
 *   chrome --remote-debugging-port=9222
 *   VUE_APP_API_URL=<api> npx vue-cli-service serve --port 8081
 *   node test/browser-check.mjs [url] [--settle=8] [--shot=/tmp/x.png]
 */

import WS from 'ws'
const WebSocket = WS.WebSocket || WS
import fs from 'fs'

const URL_ = process.argv[2] || 'http://localhost:8081/'
const arg = (k, d) => {
  const h = process.argv.find(a => a.startsWith(`--${k}=`))
  return h ? h.slice(k.length + 3) : d
}
const SETTLE = Number(arg('settle', 8)) * 1000
const SHOT = arg('shot', null)
const ROUTES = (arg('routes', '') || '').split(',').filter(Boolean)

const version = await (await fetch('http://127.0.0.1:9222/json/version')).json()
const ws = new WebSocket(version.webSocketDebuggerUrl, { maxPayload: 256 * 1024 * 1024 })
await new Promise(r => ws.once('open', r))

let id = 0
const pending = new Map()
const listeners = []
ws.on('message', (raw) => {
  const m = JSON.parse(raw)
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id) }
  else if (m.method) listeners.forEach(fn => fn(m))
})
const send = (method, params = {}, sessionId) => new Promise((res, rej) => {
  const myId = ++id
  pending.set(myId, m => m.error ? rej(new Error(method + ': ' + m.error.message)) : res(m.result))
  ws.send(JSON.stringify({ id: myId, method, params, ...(sessionId ? { sessionId } : {}) }))
})

const { targetId } = await send('Target.createTarget', { url: 'about:blank' })
const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true })

const consoleErrors = []
const pageErrors = []
const failedRequests = []
const apiCalls = []
const reqUrl = new Map()

listeners.push(m => {
  if (m.sessionId !== sessionId) return
  const p = m.params || {}
  if (m.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(p.type)) {
    consoleErrors.push({ type: p.type, text: (p.args || []).map(a => a.value ?? a.description ?? a.type).join(' ').slice(0, 300) })
  }
  if (m.method === 'Runtime.exceptionThrown') {
    const d = p.exceptionDetails || {}
    pageErrors.push((d.exception && (d.exception.description || d.exception.value)) || d.text || 'unknown')
  }
  if (m.method === 'Network.responseReceived' && /\/(clovers|users|albums|chats|orders|search|logs)/.test(p.response.url)) {
    apiCalls.push({ status: p.response.status, url: p.response.url.replace(/^https?:\/\//, '').slice(0, 78) })
  }
  if (m.method === 'Network.requestWillBeSent') reqUrl.set(p.requestId, p.request.url)
  if (m.method === 'Network.loadingFailed') {
    failedRequests.push({ text: p.errorText, type: p.type, url: (reqUrl.get(p.requestId) || '?').slice(0, 90) })
  }
})

for (const d of ['Runtime', 'Page', 'Network', 'Log']) await send(d + '.enable', {}, sessionId)

async function visit (url, label) {
  consoleErrors.length = 0; pageErrors.length = 0; failedRequests.length = 0; apiCalls.length = 0
  await send('Page.navigate', { url }, sessionId)
  await new Promise(r => setTimeout(r, SETTLE))

  const { result } = await send('Runtime.evaluate', {
    expression: `(() => {
      const app = document.querySelector('#app')
      const text = (document.body.innerText || '').trim()
      return JSON.stringify({
        title: document.title,
        appChildren: app ? app.children.length : -1,
        textLength: text.length,
        firstText: text.slice(0, 110).replace(/\\s+/g, ' '),
        imgs: document.images.length,
        brokenImgs: [...document.images].filter(i => i.complete && i.naturalWidth === 0).length,
        links: document.querySelectorAll('a').length
      })
    })()`, returnByValue: true
  }, sessionId)
  const info = JSON.parse(result.value)

  console.log(`\n  ── ${label}  ${url}`)
  console.log(`     title="${info.title}"  #app children=${info.appChildren}  text=${info.textLength} chars  imgs=${info.imgs} (${info.brokenImgs} broken)  links=${info.links}`)
  if (info.firstText) console.log(`     renders: "${info.firstText}"`)

  const bad = apiCalls.filter(c => c.status >= 400)
  console.log(`     api calls: ${apiCalls.length} (${bad.length} failed)`)
  bad.slice(0, 5).forEach(c => console.log(`       ${c.status} ${c.url}`))
  if (failedRequests.length) {
    console.log(`     network failures: ${failedRequests.length}`)
    failedRequests.slice(0, 6).forEach(f => console.log(`       ${f.text}  ${f.url}`))
  }
  if (pageErrors.length) {
    console.log(`     UNCAUGHT EXCEPTIONS: ${pageErrors.length}`)
    ;[...new Set(pageErrors)].slice(0, 4).forEach(e => console.log(`       ${String(e).split('\n')[0].slice(0, 160)}`))
  }
  if (consoleErrors.length) {
    console.log(`     console errors/warnings: ${consoleErrors.length}`)
    ;[...new Set(consoleErrors.map(c => c.type + ': ' + c.text))].slice(0, 6).forEach(t => console.log(`       ${t.slice(0, 170)}`))
  }
  return { info, pageErrors: [...pageErrors], consoleErrors: [...consoleErrors], apiCalls: [...apiCalls] }
}

const results = []
results.push(await visit(URL_, 'home'))
for (const r of ROUTES) { const path = r.startsWith('/') ? r : '/' + r; results.push(await visit(URL_.replace(/\/$/, '') + path, path)) }

if (SHOT) {
  const { data } = await send('Page.captureScreenshot', { format: 'png' }, sessionId)
  fs.writeFileSync(SHOT, Buffer.from(data, 'base64'))
  console.log(`\n  screenshot: ${SHOT}`)
}

await send('Target.closeTarget', { targetId })
ws.close()

const totalErrors = results.reduce((a, r) => a + r.pageErrors.length, 0)
const totalApiFail = results.reduce((a, r) => a + r.apiCalls.filter(c => c.status >= 400).length, 0)
console.log(`\n  ${totalErrors} uncaught exceptions, ${totalApiFail} failed API calls across ${results.length} page(s)\n`)
process.exit(totalErrors || totalApiFail ? 1 : 0)

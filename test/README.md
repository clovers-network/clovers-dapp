# Browser checks

`browser-check.mjs` loads the dapp in a real Chrome over the DevTools Protocol
and reports what actually happens: console errors, failed requests, uncaught
exceptions, and a summary of what rendered. It exists because a curl-based check
cannot see any of that — the first run against the ported backend found an
uncaught `Error: Network Error` on every page load that no HTTP test would have
caught.

```bash
# 1. a Chrome with remote debugging
chrome --remote-debugging-port=9222

# 2. the dapp against whichever backend you want to test
VUE_APP_API_URL=https://clovers-api-preview.fly.dev npx vue-cli-service serve --port 8081

# 3. the check
node test/browser-check.mjs http://localhost:8081/ \
  --routes=/garden,/feed,/activity,/users,/albums,/clovers/<board> \
  --settle=10 --shot=/tmp/dapp.png
```

Exits non-zero on any uncaught exception or failed API call, so it works in CI.

To compare two backends, run two dev servers on different ports and diff the
output — that is how the ported API was validated against production. Note that
`--settle` matters: at 9 seconds the `/garden` page had loaded 15 images against
one backend and 51 against the other, purely because one responded faster. At 18
seconds both showed 51.

`_eval.mjs` is the same plumbing for one-off expressions:

```bash
node test/_eval.mjs http://localhost:8081/activity \
  "document.querySelector('#app').__vue__.\$store.state.ethPrice" 12
```

# Deploying the dapp to Cloudflare Pages

The frontend was on Netlify, in an account (`bin-studio`) nobody here can reach.
That was the real problem: whoever controls `clovers-no-bots` on Netlify
controls what `clovers.network` serves. This moves it somewhere you own.

Live at **https://clovers-dapp.pages.dev**.

## What was deployed, and why that branch

`master` — deliberately, not `feature/vue-upgrade-appkit`.

This is a *hosting* migration. Deploying the feature branch at the same time
would have changed the wallet stack and the hosting in one step, so a failure
afterwards would have had two candidate causes. The upgrade stays a separate
decision.

Evidence `master` is what Netlify serves: the built entry chunk is
`app~748942c6.37a30db5.js` and Netlify's is `app~748942c6.da2b0742.js` — the
same webpack chunk id, differing only in content hash from a fresh dependency
resolution.

## Building it

`master` predates Node 17, and webpack 4 asks OpenSSL for MD4, which modern
Node refuses:

    error:0308010C:digital envelope routines::unsupported

    npm install --ignore-scripts --legacy-peer-deps
    NODE_OPTIONS=--openssl-legacy-provider npx vue-cli-service build --mode production
    npx wrangler pages deploy dist --project-name clovers-dapp --branch main

`--ignore-scripts` avoids the native modules that no longer compile;
`--legacy-peer-deps` gets past peer ranges written before npm 7 enforced them.

## Verified at parity

Both origins were loaded in a real Chrome over the DevTools Protocol
(`test/browser-check.mjs`) and reported identically:

| | Pages | Netlify |
|---|---|---|
| Title, `#app` children | `Welcome \| Clovers`, 5 | same |
| Rendered text | 593 chars | same |
| Images | 9, 0 broken | same |
| API calls | 41, 0 failed | same |
| Network failures | 4 | same |
| Uncaught exceptions | 1 | same |

Identical *including the bugs*, which is what parity means here:

* `min-api.cryptocompare.com` — dead price API. The fix is the unpushed commit
  on `feature/vue-upgrade-appkit`.
* `widget.portis.io` — Portis shut down; the domain no longer resolves.
* Two aborted Google Analytics beacons, an artefact of headless Chrome.

CORS was checked from the new origin: the API answers
`access-control-allow-origin: *`, so nothing needed changing server-side.

## One real difference

Netlify has Asset Optimization enabled, so its HTML replaces the individual
script tags with a single concatenated bundle on Netlify's own CDN:

    <script src='https://d33wubrfki0l68.cloudfront.net/bundles/ba9bc885….js'>

Pages serves the chunks as webpack emitted them. Functionally equivalent, and
arguably better — the Netlify bundling defeats the code-splitting the build
went to the trouble of producing. Worth knowing because it means the live site
depends on Netlify post-processing that no longer applies.

`_redirects` and `_headers` carry over unchanged; Pages honours both formats,
including the `/* /index.html 200` SPA fallback.

## Cutting the domain over

Only when you are ready — this is what takes Netlify out of the path.

1. Pages → `clovers-dapp` → Custom domains → add `clovers.network` and
   `www.clovers.network`
2. Cloudflare rewrites the apex CNAME and the `www` CNAME itself
3. Cloudflare issues its own certificate, so the Netlify renewal due around
   21 October stops mattering

There is no `wrangler pages domain` command; this is a dashboard step.

Roll back by pointing the apex and `www` CNAMEs at `clovers-no-bots.netlify.app`
again. Netlify keeps serving throughout — nothing there is deleted by this.

`dev.clovers.network` still points at `dev-clovers.netlify.app` and is left
alone deliberately; retire it separately once the main site is settled.

## Redeploying

There is no git integration — deploys are direct uploads, so a push to GitHub
does nothing on its own. Rebuild and re-run the `wrangler pages deploy` line
above. Wiring it to CI is worth doing once the branch situation settles.

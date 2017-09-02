# hackatom #2 - CloverToken

## Build Setup

``` bash
# install truffle and testrpc and zeppelin
npm install

# serve test network at localhost:8545 in a separate terminal
testrpc

# build and deploy contract onto network
truffle compile
truffle migrate

# or
tendermint --home ~/.ethermint/tendermint node
# &
ethermint --datadir ~/.ethermint --rpc --rpcaddr=0.0.0.0 --ws --wsaddr=0.0.0.0 --rpcapi eth,net,web3,personal,admin --unlock 0x7eFf122b94897EA5b0E2A9abf47B86337FAfebdC
# and type into the ethermint jargon:
1234
# then
truffle compile && truffle migrate --reset --network ethermint

# move to app and install dependencies
cd app
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report

# run unit tests
npm run unit

# run e2e tests
npm run e2e

# run all tests
npm test
```

For detailed explanation on how things work, checkout the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).

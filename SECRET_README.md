# hackatom #2 - CloverToken

## Build Setup


### install truffle and testrpc and zeppelin

`npm install`

### serve test network at localhost:8545 in a separate terminal
`testrpc  -m="correct hover crystal skill brass similar lock bone salon joke caught error" -i=666 --accounts 50`

### oracle test net bridge
`node bridge -a 49 --dev`

### build and deploy contract onto network
````
truffle compile
truffle migrate
````
### or
`tendermint --home ~/.ethermint/tendermint node`
### &
`ethermint --datadir ~/.ethermint --rpc --rpcaddr=0.0.0.0 --ws --wsaddr=0.0.0.0 --rpcapi eth,net,web3,personal,admin --unlock 0x7eFf122b94897EA5b0E2A9abf47B86337FAfebdC`
### and type into the ethermint jargon:
`1234`
### then
`truffle compile && truffle migrate --reset --network ethermint`


### or rinkeby
`geth --datadir=/Users/billy/.rinkeby --cache=1024 --syncmode=full --networkid=4 --rinkeby --rpc --rpcapi db,eth,net,web3,personal --unlock="0xcDE232e835330daFA2Ebc629219BbF4fc92cfa24"`

### &
`/Applications/Ethereum\ Wallet.app/Contents/MacOS/Ethereum\ Wallet --rpc /Users/billy/.rinkeby/geth.ipc`

### or ropsten
`geth --datadir=/Users/billy/Library/Ethereum/testnet  --fast --testnet --networkid=3 --rpc --rpcapi db,eth,net,web3,personal --unlock="0x59b809fd23B65b59D28229C3067bd26B09b80fca"  --bootnodes "enode://20c9ad97c081d63397d7b685a412227a40e23c8bdc6688c6f37e97cfbc22d2b4d1db1510d8f61e6a8866ad7f0e17c02b14182d37ea7c3c8b9c2683aeb6b733a1@52.169.14.227:30303,enode://6ce05930c72abc632c58e2e4324f7c7ea478cec0ed4fa2528982cf34483094e9cbc9216e7aa349691242576d552a2a56aaeae426c5303ded677ce455ba1acd9d@13.84.180.240:30303"`

### &
`/Applications/Ethereum\ Wallet.app/Contents/MacOS/Ethereum\ Wallet --rpc /Users/billy/Library/Ethereum/testnet/geth.ipc`


### move to app and install dependencies
````
cd app
npm install
````
### serve with hot reload at localhost:8080
`npm run dev`

### build for production with minification
`npm run build`

### build for production and view the bundle analyzer report
`npm run build --report`

### run unit tests
`npm run unit`

### run e2e tests
`npm run e2e`

### run all tests
`npm test`


For detailed explanation on how things work, checkout the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).

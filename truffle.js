module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*" // Match any network id
    },
    ethermint: {
      host: "0.0.0.0",
      port: 8545,
      network_id: "*",
      from: '0x7eFf122b94897EA5b0E2A9abf47B86337FAfebdC'
    }
  }
};

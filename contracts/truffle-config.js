const ganache = require("ganache");

let developmentProvider;

function getDevelopmentProvider() {
  if (!developmentProvider) {
    developmentProvider = ganache.provider({
      chain: { chainId: 1337 },
      logging: { quiet: true },
    });
  }
  return developmentProvider;
}

module.exports = {
  networks: {
    development: {
      provider: getDevelopmentProvider,
      // Ganache 7 reports its own network id; accept any for this provider.
      network_id: "*",
    },
    local8545: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*",
    },
  },
  compilers: {
    solc: {
      version: "0.8.19",
      settings: {
        optimizer: { enabled: true, runs: 200 },
        evmVersion: "istanbul",
      },
    },
  },
};

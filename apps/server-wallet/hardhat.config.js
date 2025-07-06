require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: "./backend/.env" });

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    hardhat: {
      // Local development network
    },
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    ...(process.env.RPC_URL && process.env.PRIVATE_KEY ? {
      goerli: {
        url: process.env.RPC_URL,
        accounts: [process.env.PRIVATE_KEY],
      },
      sepolia: {
        url: process.env.RPC_URL,
        accounts: [process.env.PRIVATE_KEY],
      },
      polygon: {
        url: process.env.RPC_URL,
        accounts: [process.env.PRIVATE_KEY],
      },
      bsc: {
        url: process.env.RPC_URL,
        accounts: [process.env.PRIVATE_KEY],
      }
    } : {})
  },
};

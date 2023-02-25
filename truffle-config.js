const { config } = require('dotenv')
const HDWalletProvider = require('@truffle/hdwallet-provider');
const fs = require('fs');

// include env VARS
config();

// get wallet mnemonic ready
const mnemonicPhrase = process.env.WALLET_MNEMONIC
const mnemonic = mnemonicPhrase.split(',').join(' ');


// configure networks
let network;
if(process.env.TRUFFLE_NETWORK){

  if(process.env.TRUFFLE_NETWORK === 'goerli'){

    network = {
      provider: () => { return new HDWalletProvider(mnemonic, `${process.env.CONTRACT_BASE_URL}/${process.env.CONTRACT_API_KEY}`) },
      network_id: 5,       
      gas: parseInt(process.env.GAS_VALUE) || 5500000,        
      gasPrice: parseInt(process.env.GAS_PRICE_VALUE) || 10000000000,
      confirmations: 2,    
      timeoutBlocks: 200,  
      skipDryRun: true
    }

  }

  if(process.env.TRUFFLE_NETWORK === 'ropsten'){

    network = {
      provider: () => { return new HDWalletProvider(mnemonic, `${process.env.CONTRACT_BASE_URL}/${process.env.CONTRACT_API_KEY}`) },
      network_id: 3,       
      gas: parseInt(process.env.GAS_VALUE) || 5500000,        
      gasPrice: parseInt(process.env.GAS_PRICE_VALUE) || 10000000000,
      confirmations: 2,    
      timeoutBlocks: 200,  
      skipDryRun: true
    }

  }

}

module.exports = {

  networks: {
    
    development: {
      host: "127.0.0.1",     // Localhost (default: none)
      port: 7545,            // Standard Ethereum port (default: none)
      network_id: "*",       // Any network (default: none)
    },

    // NB: It's important to wrap the provider as a function.
    // truffle migrate --network goerli [network_name]
    custom: network

  },

  mocha: {
    timeout: 300000,
    useColors: true
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: "0.8.12",      
      // docker: true,        
      settings: {          
       optimizer: {
         enabled: false,
         runs: 200
       },
       outputSelection: {
            '*' : {
                '*': ['*']
            }
        },
       evmVersion: "byzantium"
      }
    }
  },

  contracts_directory: './src/_dapp/contracts',
  contracts_build_directory: './src/_dapp/build',
  migrations_directory: './src/_dapp/migrations'

};

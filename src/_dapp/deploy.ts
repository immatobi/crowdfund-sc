import path from 'path'
import HDWalletProvider from '@truffle/hdwallet-provider'
import Web3 from 'web3'

const compiledFactory: any = path.resolve(__dirname, 'build', 'Factory.json');

// use Infura
// make sure to increase rate limiting
// Issue Fix: https://github.com/ChainSafe/web3.js/issues/3145

const mnemonicPhrase: string = process.env.WALLET_MNEMONIC || ''
const mnemonic: string = mnemonicPhrase.split(',').join(' '); // get wallet mnemonic ready

const provider = new HDWalletProvider(`${mnemonic}`, `${process.env.CONTRACT_BASE_URL}/${process.env.CONTRACT_API_KEY}`);
const web3 = new Web3(provider); // define a new instance of web3

let contract: any; // variable to hold the contract

const deploy = async (): Promise<void> => {

    const accounts = await web3.eth.getAccounts();
    console.log(`Attempting to deploy from account ${ accounts[0] }`);

    contract = await new web3.eth.Contract(compiledFactory.abi)
    .deploy({ data: compiledFactory.evm.bytecode.object })
    .send({ from: accounts[0], gas: parseInt('1000000') });

    console.log(JSON.stringify(compiledFactory.abi)) // this is very important (JSON stringify)
    console.log('contract deployed to: ' + contract.options.address);

    // TODO: save contract address to DB
    // Deployed to address: 
    // ABI

}

// function call
deploy()
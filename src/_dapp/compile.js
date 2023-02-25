const path = require('path');
const fs = require('fs-extra');
const solc = require('solc');

const buildPath = path.resolve(__dirname, 'build'); // set the build path
const contractPath = path.resolve(__dirname, 'contracts', 'Campaign.sol'); // set the contract filepath
const source = fs.readFileSync(contractPath, 'utf8'); // set the source 

// delete the build folder if it exist
fs.removeSync(buildPath); 

// configure solc compiler options
const input = {
    language:'Solidity',
    sources: {
        'Campaign.sol': {
            content: source
        }
    },
    settings: {
        optimizer:
        {
            enabled: true
        },
        outputSelection: {
            '*' : {
                '*': ['*']
            }
        }
    }
}

// get the compiled output
const output = JSON.parse(solc.compile(JSON.stringify(input))).contracts['Campaign.sol']; 

// create the build folder
fs.ensureDirSync(buildPath);

// write contract output to build
for(let contract in output){

    fs.outputJSONSync(
        path.resolve(buildPath, `${contract}.json`),
        output[contract]
    )

}
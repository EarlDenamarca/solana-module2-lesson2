const { Keypair } = require("@solana/web3.js")

const key = Keypair.generate();

console.log( key );
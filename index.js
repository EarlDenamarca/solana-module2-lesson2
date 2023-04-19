// Import Solana web3 functionalities
const {
    Connection,
    PublicKey,
    clusterApiUrl,
    Keypair,
    LAMPORTS_PER_SOL,
    Transaction,
    SystemProgram,
    sendAndConfirmRawTransaction,
    sendAndConfirmTransaction
} = require("@solana/web3.js");

const DEMO_FROM_SECRET_KEY = new Uint8Array(
    [
        224,  56,  54,  76,  60,  93, 211, 151, 53, 89, 107,  1,
        168,  86, 215, 243, 163, 108, 111, 117,  0, 17,  63, 11,
        141, 120, 109, 198, 150,  61,  26, 241,  2, 29, 209, 79,
         68, 220, 222,  21, 252, 191, 198,  93, 11, 94,  19,  9,
        195,  69, 219,   6, 101, 130,  58,   2, 98,  8, 204, 72,
        171,  68,  93, 240
      ]        
);

const getFromWalletBalance = async () => {
    const connection = new Connection( clusterApiUrl("devnet"), "confirmed" );
    const from = Keypair.fromSecretKey(DEMO_FROM_SECRET_KEY);
    const walletBalance = await connection.getBalance(
        new PublicKey( from.publicKey )
    );
    console.log( `FROM wallet balance: ${parseFloat( walletBalance / LAMPORTS_PER_SOL )} SOL` );
}

const getToWalletBalance = async ( toPublicKey ) => {
    const connection = new Connection( clusterApiUrl("devnet"), "confirmed" );
    const walletBalance = await connection.getBalance(
        new PublicKey( toPublicKey )
    );
    console.log( `TO wallet balance: ${parseFloat( walletBalance / LAMPORTS_PER_SOL )} SOL` );
}

const transferSol = async() => {
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

    // Get Keypair from Secret Key
    var from = Keypair.fromSecretKey(DEMO_FROM_SECRET_KEY);
    getFromWalletBalance();

    // Other things to try: 
    // 1) Form array from userSecretKey
    // const from = Keypair.fromSecretKey(Uint8Array.from(userSecretKey));
    // 2) Make a new Keypair (starts with 0 SOL)
    // const from = Keypair.generate();

    // Generate another Keypair (account we'll be sending to)
    const to = Keypair.generate();
    getToWalletBalance( to.publicKey );

    // Aidrop 2 SOL to Sender wallet
    console.log("Airdopping some SOL to Sender wallet!");
    const fromAirDropSignature = await connection.requestAirdrop(
        new PublicKey(from.publicKey),
        2 * LAMPORTS_PER_SOL
    );

    // Latest blockhash (unique identifer of the block) of the cluster
    let latestBlockHash = await connection.getLatestBlockhash();

    // Confirm transaction using the last valid block height (refers to its time)
    // to check for transaction expiration
    await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: fromAirDropSignature
    });

    console.log("Airdrop completed for the Sender account");
    getFromWalletBalance();

    // Send money from "from" wallet and into "to" wallet
    var transaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: from.publicKey,
            toPubkey: to.publicKey,
            lamports: LAMPORTS_PER_SOL / 100
        })
    );

    // Sign transaction
    var signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [from]
    );
    console.log('Signature is ', signature);
    getToWalletBalance( to.publicKey );
}

transferSol();

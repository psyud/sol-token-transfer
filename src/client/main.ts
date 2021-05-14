import { Connection, Account, TransactionInstruction, sendAndConfirmTransaction, Transaction } from '@solana/web3.js';
import path from 'path';
import fs from 'mz/fs';

const PROGRAM_PATH = path.join(path.resolve(__dirname, '../../dist/program'));
const PROGRAM_KEYPAIR_PATH = path.join(PROGRAM_PATH, 'sol_toke_transfer-keypair.json');

function getConnection() {
    return new Connection('http://localhost:8899', 'confirmed');
}

async function main() {
    let connection = getConnection();
    let sender = await newAccount(connection);
    let receiver = await newAccount(connection);

    await sendLamports(sender, receiver, connection);

    const senderBalanceAfter = await connection.getBalance(sender.publicKey);
    const receiverBalanceAfter = await connection.getBalance(receiver.publicKey);

    console.log(senderBalanceAfter, receiverBalanceAfter);
}

async function newAccount(connection: Connection) {
    const account = new Account();
    const sig = await connection.requestAirdrop(
        account.publicKey,
        100000
    );
    await connection.confirmTransaction(sig);
    return account;
}

async function readAccountFromFile(path: string) {
    const keypair = await fs.readFile(path, { encoding: 'utf-8' });
    return new Account(Buffer.from(JSON.parse(keypair)));
}

main().then(() => process.exit(), err => {
    console.error(err);
    process.exit(-1);
})

async function sendLamports(sender: Account, receiver: Account, connection: Connection) {
    const program = await readAccountFromFile(PROGRAM_KEYPAIR_PATH);
    const instruction = new TransactionInstruction({
        keys: [
            {
                pubkey: sender.publicKey, 
                isSigner: true,
                isWritable: true
            },
            {
                pubkey: receiver.publicKey,
                isSigner: false,
                isWritable: true
            }
        ],
        programId: program.publicKey,
        data: Buffer.alloc(0)
    });

    await sendAndConfirmTransaction(connection, new Transaction().add(instruction), [sender]);
}
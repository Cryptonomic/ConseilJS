import * as fs from "fs";

import {Wallet, EncryptedWalletVersionOne} from "../../types/wallet/Wallet";
import {KeyStore} from "../../types/wallet/KeyStore";
import {CryptoUtils} from "../../utils/CryptoUtils";
import {TezosMessageUtils} from '../../chain/tezos/TezosMessageUtil';

/**
 * Functions for Tezos file wallet functionality.
 */
export namespace TezosFileWallet {
    /**
     * Saves a wallet to a given file.
     * 
     * @param {string} filename Name of file
     * @param {Wallet} wallet Wallet object
     * @param {string} passphrase User-supplied passphrase
     * @returns {Promise<Wallet>} Wallet object loaded from disk
     */
    export async function saveWallet(filename: string, wallet: Wallet, passphrase: string): Promise<Wallet> {
        const keys = JSON.stringify(wallet.identities);
        const salt = await CryptoUtils.generateSaltForPwHash();
        const encryptedKeys = await CryptoUtils.encryptMessage(keys, passphrase, salt);

        const encryptedWallet: EncryptedWalletVersionOne = {
            version: '1',
            salt: TezosMessageUtils.readBufferWithHint(salt, ''),
            ciphertext: TezosMessageUtils.readBufferWithHint(encryptedKeys, ''),
            kdf: 'Argon2'
        };

        const p = new Promise((resolve, reject) => {
            fs.writeFile(filename, JSON.stringify(encryptedWallet), err => {
                if (err) { reject(err); }
                else resolve();
            });
        });
        await p;
        return loadWallet(filename, passphrase);
    }

    /**
     * Loads a wallet from a given file.
     * 
     * @param {string} filename Name of file
     * @param {string} passphrase User-supplied passphrase
     * @returns {Promise<Wallet>} Loaded wallet
     */
    export async function loadWallet(filename: string, passphrase: string): Promise<Wallet> {
        const p = new Promise<EncryptedWalletVersionOne>((resolve, reject) => {
            fs.readFile(filename, (err, data) => {
                if (err) { reject(err); return; }
                const encryptedWallet: EncryptedWalletVersionOne = JSON.parse(data.toString()) as EncryptedWalletVersionOne;
                resolve(encryptedWallet);
            });
        });

        const ew = await p;
        const encryptedKeys = TezosMessageUtils.writeBufferWithHint(ew.ciphertext);
        const salt = TezosMessageUtils.writeBufferWithHint(ew.salt);
        const keys = JSON.parse(await CryptoUtils.decryptMessage(encryptedKeys, passphrase, salt)) as KeyStore[];

        return { identities: keys };
    }

    /**
     * Creates a new wallet file.
     * @param {string} filename Where to save the wallet file
     * @param {string} password User-supplied passphrase used to secure wallet file
     * @returns {Promise<Wallet>} Object corresponding to newly-created wallet
     */
    export async function createWallet(filename: string, password: string): Promise<any> {
        const wallet: Wallet = { identities: [] };
        await saveWallet(filename, wallet, password);

        return wallet
    }
}

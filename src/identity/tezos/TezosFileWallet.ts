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
        return new Promise<Wallet>(((resolve, reject) => {
            const keys = JSON.stringify(wallet.identities);
            const salt = CryptoUtils.generateSaltForPwHash();
            let encryptedKeys;
            try {
                encryptedKeys = CryptoUtils.encryptMessage(keys, passphrase, salt);
            } catch (err) {
                reject(err);
            }
            
            const encryptedWallet: EncryptedWalletVersionOne = {
                version: '1',
                salt: TezosMessageUtils.readBufferWithHint(salt, ''),
                ciphertext: TezosMessageUtils.readBufferWithHint(encryptedKeys, ''),
                kdf: 'Argon2'
            };

            try {
                fs.writeFile(filename, JSON.stringify(encryptedWallet), err => {
                    if (err) { reject(err); }
                    resolve(loadWallet(filename, passphrase));
                });
            } catch (err) {
                reject(err);
            }
        }));
    }

    /**
     * Loads a wallet from a given file.
     * 
     * @param {string} filename Name of file
     * @param {string} passphrase User-supplied passphrase
     * @returns {Promise<Wallet>} Loaded wallet
     */
    export async function loadWallet(filename: string, passphrase: string): Promise<Wallet> {
        return new Promise<Wallet>((resolve, reject) => {
            fs.readFile(filename, (err, data) => {
                if (err) { reject(err); }
                const encryptedWallet: EncryptedWalletVersionOne = JSON.parse(data.toString()) as EncryptedWalletVersionOne;
                const encryptedKeys = TezosMessageUtils.writeBufferWithHint(encryptedWallet.ciphertext);
                const salt = TezosMessageUtils.writeBufferWithHint(encryptedWallet.salt);
                try {
                    const keys = JSON.parse(CryptoUtils.decryptMessage(encryptedKeys, passphrase, salt)) as KeyStore[];
                    resolve({identities: keys});
                } catch(e) {
                    reject(e);
                }
            });
        });
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

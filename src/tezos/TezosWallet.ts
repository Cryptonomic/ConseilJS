import {Wallet, EncryptedWalletVersionOne} from "../types/Wallet";
import {KeyStore, StoreType} from "../types/KeyStore";
import {Error} from "../types/Error";
import * as CryptoUtils from "../utils/CryptoUtils";
import * as fs from "fs";

export namespace TezosWallet {
    /**
     * Functions for Tezos wallet functionality.
     */

    /**
     * Saves a wallet to a given file.
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
                salt: CryptoUtils.base58CheckEncode(salt, ""),
                ciphertext: CryptoUtils.base58CheckEncode(encryptedKeys, ""),
                kdf: 'Argon2'
            };
        
            try {
                fs.writeFile(filename, JSON.stringify(encryptedWallet), err => {
                    if (err) reject(err);
                    resolve(loadWallet(filename, passphrase))
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
                if (err) reject(err);
                const encryptedWallet: EncryptedWalletVersionOne = <EncryptedWalletVersionOne> JSON.parse(data.toString());
                const encryptedKeys = CryptoUtils.base58CheckDecode(encryptedWallet.ciphertext, "");
                const salt = CryptoUtils.base58CheckDecode(encryptedWallet.salt, "");
                try {
                    const keys = <KeyStore[]> JSON.parse(CryptoUtils.decryptMessage(encryptedKeys, passphrase, salt));
                    resolve({identities: keys});
                }
                catch(e) {
                    reject(e);
                }
            });
        });
    }

    /**
     * Creates a new wallet file.
     * @param {string} filename Where to save the wallet file
     * @param {string} password User-supplied passphrase used to secure wallet file
     * @returns {Promise<Wallet>}   Object corresponding to newly-created wallet
     */
    export async function createWallet(filename: string, password: string): Promise<any> {
        const wallet: Wallet = {
            identities: []
        };
        await saveWallet(filename, wallet, password);
        return wallet
    }

    /**
     * Unlocks an identity supplied during the 2017 Tezos fundraiser.
     * 
     * @param {string} mnemonic Fifteen word mnemonic phrase from fundraiser PDF.
     * @param {string} email Email address from fundraiser PDF.
     * @param {string} password Password from fundraiser PDF.
     * @param {string} pkh The public key hash supposedly produced by the given mnemonic and passphrase
     * @returns {KeyStore} Wallet file
     */
    export function unlockFundraiserIdentity(
        mnemonic: string,
        email: string,
        password: string,
        pkh: string): KeyStore | Error {

        return CryptoUtils.getKeysFromMnemonicAndPassphrase(
            mnemonic,
            email + password,
            pkh,
            true,
            StoreType.Fundraiser
        )
    }

    /**
     * Generates a fifteen word mnemonic phrase using the BIP39 standard.
     * @returns {string}
     */
    export function generateMnemonic(): string {
        return CryptoUtils.generateMnemonic();
    }

    /**
     * Generates a key pair based on a mnemonic.
     * @param {string} mnemonic Fifteen word memonic phrase
     * @param {string} passphrase   User-supplied passphrase
     * @returns {KeyStore}  Unlocked key pair
     */
    export function unlockIdentityWithMnemonic(mnemonic: string, passphrase: string): KeyStore | Error{
        return CryptoUtils.getKeysFromMnemonicAndPassphrase(
            mnemonic,
            passphrase,
            "",
            false,
            StoreType.Mnemonic
        );
    }
}

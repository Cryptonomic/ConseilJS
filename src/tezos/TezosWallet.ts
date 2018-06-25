import {Wallet, EncryptedWalletVersionOne} from "../types/Wallet";
import {KeyStore} from "../types/KeyStore";
import {Error} from "../types/Error";
import * as CryptoUtils from "../utils/CryptoUtils";
import * as fs from "fs";
import PasswordValidator from "password-validator";

export namespace TezosWallet {
    /**
     * Functions for Tezos wallet functionality.
     */

    /**
     * Saves a wallet to a given file.
     * @param {string} filename Name of file
     * @param {Wallet} wallet   Wallet object
     * @param {string} passphrase User-supplied passphrase
     * @returns {Promise<Wallet>} Wallet object loaded from disk
     */
    export async function saveWallet(filename: string, wallet: Wallet, passphrase: string): Promise<Wallet> {
        const keys = JSON.stringify(wallet.identities);
        const salt = CryptoUtils.generateSaltForPwHash();
        const encryptedKeys = CryptoUtils.encryptMessage(keys, passphrase, salt);
        const encryptedWallet: EncryptedWalletVersionOne = {
            version: '1',
            salt: CryptoUtils.base58CheckEncode(salt, ""),
            ciphertext: CryptoUtils.base58CheckEncode(encryptedKeys, ""),
            kdf: 'Argon2'
        };
        return new Promise<Wallet>(((resolve, reject) => {
            try {
                fs.writeFile(filename, JSON.stringify(encryptedWallet), err => {
                    if (err) reject(err);
                    resolve(loadWallet(filename, passphrase))
                })
            } catch (err) {
                reject(err);
            }
        }))
    }

    /**
     * Loads a wallet from a given file.
     * @param {string} filename Name of file
     * @param {string} passphrase User-supplied passphrase
     * @returns {Promise<Wallet>}   Loaded wallet
     */
    export async function loadWallet(filename: string, passphrase: string): Promise<Wallet> {
        return new Promise<Wallet>((resolve, reject) => {
            fs.readFile(filename, (err, data) => {
                if (err) reject(err);
                const encryptedWallet: EncryptedWalletVersionOne = <EncryptedWalletVersionOne> JSON.parse(data.toString());
                const encryptedKeys = CryptoUtils.base58CheckDecode(encryptedWallet.ciphertext, "");
                const salt = CryptoUtils.base58CheckDecode(encryptedWallet.salt, "");
                const keys = <KeyStore[]> JSON.parse(CryptoUtils.decryptMessage(encryptedKeys, passphrase, salt));
                resolve({identities: keys})
            });
        })
    }

    /**
     * Creates a new wallet file.
     * @param {string} filename Where to save the wallet file
     * @param {string} password User-supplied passphrase used to secure wallet file
     * @returns {Promise<Wallet>}   Object corresponding to newly-created wallet
     */
    export async function createWallet(filename: string, password: string): Promise<any> {
        const schema = new PasswordValidator();
        schema
        .is().min(8)
        .is().max(100)
        .has().uppercase()
        .has().lowercase()
        .has().digits()
        .has().symbols()
        .has().not().spaces();  
        if (!schema.validate(password)) {
            return new Promise((resolve, reject) => {            
                reject({error: "The password wasn't validated."});
            });
        }
        const wallet: Wallet = {
            identities: []
        };
        await saveWallet(filename, wallet, password);
        return wallet
    }

    /**
     * Unlocks an identity supplied during the 2017 Tezos fundraiser.
     * @param {string} mnemonic Fifteen word mnemonic phrase from fundraiser PDF.
     * @param {string} email    Email address from fundraiser PDF.
     * @param {string} password Password from fundraiser PDF.
     * @returns {KeyStore}  Wallet file
     */
    export function unlockFundraiserIdentity(mnemonic: string, email: string, password: string): KeyStore | Error {
        const passphrase = email + password;
        return CryptoUtils.getKeysFromMnemonicAndPassphrase(mnemonic, passphrase)
    }

    /**
     * Generates a fifteen word mnemonic phrase using the BIP39 standard.
     * @returns {string}
     */
    export function generateMnemonic(): string {
        return CryptoUtils.generateMnemonic()
    }

    /**
     * Generates a key pair based on a mnemonic.
     * @param {string} mnemonic Fifteen word memonic phrase
     * @param {string} passphrase   User-supplied passphrase
     * @returns {KeyStore}  Unlocked key pair
     */
    export function unlockIdentityWithMnemonic(mnemonic: string, passphrase: string): KeyStore | Error{
        return CryptoUtils.getKeysFromMnemonicAndPassphrase(mnemonic, passphrase)
    }
    
}
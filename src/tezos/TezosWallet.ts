import {Wallet} from "../types/Wallet";
import * as fs from "fs";
import {KeyStore} from "../types/KeyStore";
import * as CryptoUtils from "../utils/CryptoUtils";

/**
 * Functions for Tezos wallet functionality.
 */

/**
 * Creates a new wallet file.
 * TODO: Add encryption.
 * @param {string} filename Where to save the wallet file
 * @param {string} password User-supplies passphrase used to secure wallet file
 * @returns {Promise<Wallet>}   Object corresponding to newly-created wallet
 */
export function createWallet(filename: string, password: string): Promise<Wallet> {
    return new Promise<Wallet>((resolve, reject) => {
        if (fs.existsSync(filename)) reject("A wallet already exists at this path!");
        const wallet: Wallet = {
            identities: []
        };
        fs.writeFile(filename, JSON.stringify(wallet), (err) => {
            if (err) reject(err);
            resolve(wallet)
        });
    })
}

/**
 * Saves a wallet to a given file.
 * TODO: Reload wallet from disk and return contents.
 * @param {string} filename Name of file
 * @param {Wallet} wallet   Wallet object
 * @returns {Promise<Wallet>} Wallet object loaded from disk
 */
export function saveWallet(filename: string, wallet: Wallet): Promise<Wallet> {
    return new Promise<Wallet>((resolve, reject) => {
        fs.writeFile(filename, JSON.stringify(wallet), (err) => {
            if (err) reject(err);
            resolve(wallet)
        });
    })
}

/**
 * Loads a wallet from a given file.
 * TODO: Add decryption.
 * @param {string} filename Name of file
 * @param {string} password User-supplied passphrase
 * @returns {Promise<Wallet>}   Loaded wallet
 */
export function loadWallet(filename: string, password: string): Promise<Wallet> {
    return new Promise<Wallet>((resolve, reject) => {
        fs.readFile(filename, (err, data) => {
            if (err) reject(err);
            const wallet = <Wallet> JSON.parse(data.toString());
            resolve(wallet)
        });
    })
}

/**
 * Unlocks an identity supplied during the 2017 Tezos fundraiser.
 * @param {string} mnemonic Fifteen word mnemonic phrase from fundraiser PDF.
 * @param {string} email    Email address from fundraiser PDF.
 * @param {string} password Password from fundraiser PDF.
 * @returns {KeyStore}  Wallet file
 */
export function unlockFundraiserIdentity(mnemonic: string, email: string, password: string): KeyStore {
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
export function unlockIdentityWithMnemonic(mnemonic: string, passphrase: string): KeyStore {
    return CryptoUtils.getKeysFromMnemonicAndPassphrase(mnemonic, passphrase)
}
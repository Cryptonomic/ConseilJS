import {Wallet} from "../types/Wallet";
import {KeyStore} from "../types/KeyStore";
import * as CryptoUtils from "../utils/CryptoUtils";

const fsPromises = require('fs').promises;

/**
 * Functions for Tezos wallet functionality.
 */

/**
 * Saves a wallet to a given file.
 * @param {string} filename Name of file
 * @param {Wallet} wallet   Wallet object
 * @param {string} password User-supplied passphrase
 * @returns {Promise<Wallet>} Wallet object loaded from disk
 */
export async function saveWallet(filename: string, wallet: Wallet, password: string): Promise<Wallet> {
    await fsPromises.writeFile(filename, JSON.stringify(wallet));
    return loadWallet(filename, password)
}

/**
 * Loads a wallet from a given file.
 * @param {string} filename Name of file
 * @param {string} password User-supplied passphrase
 * @returns {Promise<Wallet>}   Loaded wallet
 */
export async function loadWallet(filename: string, password: string): Promise<Wallet> {
    const data = await fsPromises.readFile(filename);
    return <Wallet> JSON.parse(data.toString())
}

/**
 * Creates a new wallet file.
 * @param {string} filename Where to save the wallet file
 * @param {string} password User-supplied passphrase used to secure wallet file
 * @returns {Promise<Wallet>}   Object corresponding to newly-created wallet
 */
export async function createWallet(filename: string, password: string): Promise<Wallet> {
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
import { Wallet } from "../types/Wallet";
import { KeyStore } from "../types/KeyStore";
import { Error } from "../types/Error";
export declare namespace TezosWallet {
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
    function saveWallet(filename: string, wallet: Wallet, passphrase: string): Promise<Wallet>;
    /**
     * Loads a wallet from a given file.
     * @param {string} filename Name of file
     * @param {string} passphrase User-supplied passphrase
     * @returns {Promise<Wallet>}   Loaded wallet
     */
    function loadWallet(filename: string, passphrase: string): Promise<Wallet>;
    /**
     * Creates a new wallet file.
     * @param {string} filename Where to save the wallet file
     * @param {string} password User-supplied passphrase used to secure wallet file
     * @returns {Promise<Wallet>}   Object corresponding to newly-created wallet
     */
    function createWallet(filename: string, password: string): Promise<any>;
    /**
     * Unlocks an identity supplied during the 2017 Tezos fundraiser.
     * @param {string} mnemonic Fifteen word mnemonic phrase from fundraiser PDF.
     * @param {string} email    Email address from fundraiser PDF.
     * @param {string} password Password from fundraiser PDF.
     * @param {string} pkh  The public key hash supposedly produced by the given mnemonic and passphrase
     * @returns {KeyStore}  Wallet file
     */
    function unlockFundraiserIdentity(mnemonic: string, email: string, password: string, pkh: string): KeyStore | Error;
    /**
     * Generates a fifteen word mnemonic phrase using the BIP39 standard.
     * @returns {string}
     */
    function generateMnemonic(): string;
    /**
     * Generates a key pair based on a mnemonic.
     * @param {string} mnemonic Fifteen word memonic phrase
     * @param {string} passphrase   User-supplied passphrase
     * @returns {KeyStore}  Unlocked key pair
     */
    function unlockIdentityWithMnemonic(mnemonic: string, passphrase: string): KeyStore | Error;
}

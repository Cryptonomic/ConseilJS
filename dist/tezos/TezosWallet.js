"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const KeyStore_1 = require("../types/KeyStore");
const CryptoUtils = __importStar(require("../utils/CryptoUtils"));
const fs = __importStar(require("fs"));
var TezosWallet;
(function (TezosWallet) {
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
    function saveWallet(filename, wallet, passphrase) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise(((resolve, reject) => {
                const keys = JSON.stringify(wallet.identities);
                const salt = CryptoUtils.generateSaltForPwHash();
                let encryptedKeys;
                try {
                    encryptedKeys = CryptoUtils.encryptMessage(keys, passphrase, salt);
                }
                catch (err) {
                    reject(err);
                }
                const encryptedWallet = {
                    version: '1',
                    salt: CryptoUtils.base58CheckEncode(salt, ""),
                    ciphertext: CryptoUtils.base58CheckEncode(encryptedKeys, ""),
                    kdf: 'Argon2'
                };
                try {
                    fs.writeFile(filename, JSON.stringify(encryptedWallet), err => {
                        if (err)
                            reject(err);
                        resolve(loadWallet(filename, passphrase));
                    });
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    TezosWallet.saveWallet = saveWallet;
    /**
     * Loads a wallet from a given file.
     * @param {string} filename Name of file
     * @param {string} passphrase User-supplied passphrase
     * @returns {Promise<Wallet>}   Loaded wallet
     */
    function loadWallet(filename, passphrase) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                fs.readFile(filename, (err, data) => {
                    if (err)
                        reject(err);
                    const encryptedWallet = JSON.parse(data.toString());
                    const encryptedKeys = CryptoUtils.base58CheckDecode(encryptedWallet.ciphertext, "");
                    const salt = CryptoUtils.base58CheckDecode(encryptedWallet.salt, "");
                    try {
                        const keys = JSON.parse(CryptoUtils.decryptMessage(encryptedKeys, passphrase, salt));
                        resolve({ identities: keys });
                    }
                    catch (e) {
                        reject(e);
                    }
                });
            });
        });
    }
    TezosWallet.loadWallet = loadWallet;
    /**
     * Creates a new wallet file.
     * @param {string} filename Where to save the wallet file
     * @param {string} password User-supplied passphrase used to secure wallet file
     * @returns {Promise<Wallet>}   Object corresponding to newly-created wallet
     */
    function createWallet(filename, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const wallet = {
                identities: []
            };
            yield saveWallet(filename, wallet, password);
            return wallet;
        });
    }
    TezosWallet.createWallet = createWallet;
    /**
     * Unlocks an identity supplied during the 2017 Tezos fundraiser.
     * @param {string} mnemonic Fifteen word mnemonic phrase from fundraiser PDF.
     * @param {string} email    Email address from fundraiser PDF.
     * @param {string} password Password from fundraiser PDF.
     * @param {string} pkh  The public key hash supposedly produced by the given mnemonic and passphrase
     * @returns {KeyStore}  Wallet file
     */
    function unlockFundraiserIdentity(mnemonic, email, password, pkh) {
        const passphrase = email + password;
        return CryptoUtils.getKeysFromMnemonicAndPassphrase(mnemonic, passphrase, pkh, true, KeyStore_1.StoreType.Fundraiser);
    }
    TezosWallet.unlockFundraiserIdentity = unlockFundraiserIdentity;
    /**
     * Generates a fifteen word mnemonic phrase using the BIP39 standard.
     * @returns {string}
     */
    function generateMnemonic() {
        return CryptoUtils.generateMnemonic();
    }
    TezosWallet.generateMnemonic = generateMnemonic;
    /**
     * Generates a key pair based on a mnemonic.
     * @param {string} mnemonic Fifteen word memonic phrase
     * @param {string} passphrase   User-supplied passphrase
     * @returns {KeyStore}  Unlocked key pair
     */
    function unlockIdentityWithMnemonic(mnemonic, passphrase) {
        return CryptoUtils.getKeysFromMnemonicAndPassphrase(mnemonic, passphrase, "", false, KeyStore_1.StoreType.Mnemonic);
    }
    TezosWallet.unlockIdentityWithMnemonic = unlockIdentityWithMnemonic;
})(TezosWallet = exports.TezosWallet || (exports.TezosWallet = {}));
//# sourceMappingURL=TezosWallet.js.map
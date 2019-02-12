"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sodium = __importStar(require("libsodium-wrappers"));
const sodiumsumo = __importStar(require("libsodium-wrappers-sumo"));
const crypto = __importStar(require("crypto"));
const zxcvbn_1 = __importDefault(require("zxcvbn"));
var CryptoUtils;
(function (CryptoUtils) {
    function generateSaltForPwHash() {
        return crypto.randomBytes(sodiumsumo.crypto_pwhash_SALTBYTES);
    }
    CryptoUtils.generateSaltForPwHash = generateSaltForPwHash;
    function encryptMessage(message, passphrase, salt) {
        const passwordStrength = getPasswordStrength(passphrase);
        if (passwordStrength < 3) {
            throw new Error('The password strength should not be less than 3.');
        }
        const messageBytes = sodiumsumo.from_string(message);
        const keyBytes = sodiumsumo.crypto_pwhash(sodiumsumo.crypto_box_SEEDBYTES, passphrase, salt, sodiumsumo.crypto_pwhash_OPSLIMIT_INTERACTIVE, sodiumsumo.crypto_pwhash_MEMLIMIT_INTERACTIVE, sodiumsumo.crypto_pwhash_ALG_DEFAULT);
        const nonce = Buffer.from(sodiumsumo.randombytes_buf(sodiumsumo.crypto_box_NONCEBYTES));
        const cipherText = Buffer.from(sodiumsumo.crypto_secretbox_easy(messageBytes, nonce, keyBytes));
        return Buffer.concat([nonce, cipherText]);
    }
    CryptoUtils.encryptMessage = encryptMessage;
    function decryptMessage(nonce_and_ciphertext, passphrase, salt) {
        const keyBytes = sodiumsumo.crypto_pwhash(sodiumsumo.crypto_box_SEEDBYTES, passphrase, salt, sodiumsumo.crypto_pwhash_OPSLIMIT_INTERACTIVE, sodiumsumo.crypto_pwhash_MEMLIMIT_INTERACTIVE, sodiumsumo.crypto_pwhash_ALG_DEFAULT);
        if (nonce_and_ciphertext.length < sodiumsumo.crypto_secretbox_NONCEBYTES + sodiumsumo.crypto_secretbox_MACBYTES) {
            throw new Error("The cipher text is of insufficient length");
        }
        const nonce = nonce_and_ciphertext.slice(0, sodiumsumo.crypto_secretbox_NONCEBYTES);
        const ciphertext = nonce_and_ciphertext.slice(sodiumsumo.crypto_secretbox_NONCEBYTES);
        return sodiumsumo.crypto_secretbox_open_easy(ciphertext, nonce, keyBytes, 'text');
    }
    CryptoUtils.decryptMessage = decryptMessage;
    function simpleHash(payload, length) {
        return sodiumsumo.crypto_generichash(length, payload);
    }
    CryptoUtils.simpleHash = simpleHash;
    function getPasswordStrength(password) {
        const results = zxcvbn_1.default(password);
        return results.score;
    }
    CryptoUtils.getPasswordStrength = getPasswordStrength;
    function generateKeys(seed) {
        const key_pair = sodiumsumo.crypto_sign_seed_keypair(seed, '');
        return { privateKey: key_pair.privateKey, publicKey: key_pair.publicKey };
    }
    CryptoUtils.generateKeys = generateKeys;
    function signDetached(payload, privateKey) {
        return sodium.crypto_sign_detached(payload, privateKey);
    }
    CryptoUtils.signDetached = signDetached;
})(CryptoUtils = exports.CryptoUtils || (exports.CryptoUtils = {}));
//# sourceMappingURL=CryptoUtils.js.map
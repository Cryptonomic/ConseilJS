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
const sodium = __importStar(require("sodium-native"));
const zxcvbn_1 = __importDefault(require("zxcvbn"));
var CryptoUtils;
(function (CryptoUtils) {
    function generateSaltForPwHash() {
        let rand = Buffer.alloc(sodium.crypto_pwhash_SALTBYTES);
        sodium.randombytes_buf(rand);
        return rand;
    }
    CryptoUtils.generateSaltForPwHash = generateSaltForPwHash;
    function encryptMessage(message, passphrase, salt) {
        const passwordStrength = getPasswordStrength(passphrase);
        if (passwordStrength < 3) {
            throw new Error('The password strength should not be less than 3.');
        }
        const pwhash = Buffer.alloc(sodium.crypto_box_SEEDBYTES);
        sodium.crypto_pwhash(pwhash, Buffer.from(passphrase), salt, sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE, sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE, sodium.crypto_pwhash_ALG_DEFAULT);
        let nonce = Buffer.alloc(sodium.crypto_box_NONCEBYTES);
        sodium.randombytes_buf(nonce);
        let ciphertext = Buffer.alloc(message.length + sodium.crypto_secretbox_MACBYTES);
        sodium.crypto_secretbox_easy(ciphertext, Buffer.from(message), nonce, pwhash);
        return Buffer.concat([nonce, ciphertext]);
    }
    CryptoUtils.encryptMessage = encryptMessage;
    function decryptMessage(nonce_and_ciphertext, passphrase, salt) {
        if (nonce_and_ciphertext.length < sodium.crypto_secretbox_NONCEBYTES + sodium.crypto_secretbox_MACBYTES) {
            throw new Error("The cipher text is of insufficient length");
        }
        const pwhash = Buffer.alloc(sodium.crypto_box_SEEDBYTES);
        sodium.crypto_pwhash(pwhash, Buffer.from(passphrase), salt, sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE, sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE, sodium.crypto_pwhash_ALG_DEFAULT);
        const nonce = nonce_and_ciphertext.slice(0, sodium.crypto_secretbox_NONCEBYTES);
        const ciphertext = nonce_and_ciphertext.slice(sodium.crypto_secretbox_NONCEBYTES);
        let message = Buffer.alloc(ciphertext.length - sodium.crypto_secretbox_MACBYTES);
        sodium.crypto_secretbox_open_easy(message, ciphertext, nonce, pwhash);
        return message.toString();
    }
    CryptoUtils.decryptMessage = decryptMessage;
    function simpleHash(payload, length) {
        let hash = Buffer.alloc(length);
        sodium.crypto_generichash(hash, payload);
        return hash;
    }
    CryptoUtils.simpleHash = simpleHash;
    function getPasswordStrength(password) {
        const results = zxcvbn_1.default(password);
        return results.score;
    }
    CryptoUtils.getPasswordStrength = getPasswordStrength;
    function generateKeys(seed) {
        let secretKey = Buffer.alloc(sodium.crypto_sign_SECRETKEYBYTES);
        let publicKey = Buffer.alloc(sodium.crypto_sign_PUBLICKEYBYTES);
        sodium.crypto_sign_seed_keypair(publicKey, secretKey, seed);
        return { privateKey: secretKey, publicKey: publicKey };
    }
    CryptoUtils.generateKeys = generateKeys;
    function signDetached(payload, secretKey) {
        let sig = Buffer.alloc(sodium.crypto_sign_BYTES);
        sodium.crypto_sign_detached(sig, payload, secretKey);
        return sig;
    }
    CryptoUtils.signDetached = signDetached;
})(CryptoUtils = exports.CryptoUtils || (exports.CryptoUtils = {}));
//# sourceMappingURL=CryptoUtils.js.map
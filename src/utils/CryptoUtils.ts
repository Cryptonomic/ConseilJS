import * as sodium from 'sodium-native';
import zxcvbn from 'zxcvbn';

/**
 * Cryptography helpers
 */
export namespace CryptoUtils {
    /**
     * Generates a salt for key derivation.
     * 
     * @returns {Buffer} Salt
     */
    export function generateSaltForPwHash() {
        let rand = Buffer.alloc(sodium.crypto_pwhash_SALTBYTES);
        sodium.randombytes_buf(rand);

        return rand;
    }

    /**
     * Encrypts a given message using a passphrase
     * 
     * @param {string} message Message to encrypt
     * @param {string} passphrase User-supplied passphrase
     * @param {Buffer} salt Salt for key derivation
     * @returns {Buffer} Concatenated bytes of nonce and cipher text
     */
    export function encryptMessage(message: string, passphrase: string, salt: Buffer) : Buffer {
        const passwordStrength = getPasswordStrength(passphrase);
        if (passwordStrength < 3) { throw new Error('The password strength should not be less than 3.'); }

        const pwhash = Buffer.alloc(sodium.crypto_box_SEEDBYTES);
        sodium.crypto_pwhash(pwhash, Buffer.from(passphrase), salt, sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE, sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE, sodium.crypto_pwhash_ALG_DEFAULT);

        let nonce = Buffer.alloc(sodium.crypto_box_NONCEBYTES);
        sodium.randombytes_buf(nonce);

        let ciphertext = Buffer.alloc(message.length + sodium.crypto_secretbox_MACBYTES);
        sodium.crypto_secretbox_easy(ciphertext, Buffer.from(message), nonce, pwhash);

        return Buffer.concat([nonce, ciphertext]);
    }

    /**
     * Decrypts a given message using a passphrase
     * 
     * @param {Buffer} nonce_and_ciphertext Concatenated bytes of nonce and cipher text
     * @param {string} passphrase User-supplied passphrase
     * @param {Buffer} salt Salt for key derivation
     * @returns {string} Decrypted message
     */
    export function decryptMessage(nonce_and_ciphertext: Buffer, passphrase: string, salt: Buffer) : string{
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

    export function simpleHash(payload: Buffer, length: number) : Buffer {
        let hash = Buffer.alloc(length);
        sodium.crypto_generichash(hash, payload);

        return hash;
    }

    /**
     * Checking the password strength using zxcvbn
     * @returns {number} Password score
     */
    export function getPasswordStrength(password: string): number {
        const results = zxcvbn(password);
        return results.score;
    }

    export function generateKeys(seed: string) {
        let secretKey = Buffer.alloc(sodium.crypto_sign_SECRETKEYBYTES);
        let publicKey = Buffer.alloc(sodium.crypto_sign_PUBLICKEYBYTES);
        sodium.crypto_sign_seed_keypair(publicKey, secretKey, seed);

        return { privateKey: secretKey, publicKey: publicKey };
    }

    export function signDetached(payload: Buffer, secretKey: Buffer) : Buffer {
        let sig = Buffer.alloc(sodium.crypto_sign_BYTES);
        sodium.crypto_sign_detached(sig, payload, secretKey);

        return sig;
    }
}

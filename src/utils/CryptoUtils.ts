import * as sodiumsumo from 'libsodium-wrappers-sumo';
import zxcvbn from 'zxcvbn';

/**
 * Cryptography helpers
 */
export namespace CryptoUtils {
    /**
     * Generates a salt for key derivation.
     * @returns {Buffer} Salt
     */
    export function generateSaltForPwHash() {
        return sodiumsumo.randombytes_buf(sodiumsumo.crypto_pwhash_SALTBYTES)
    }

    /**
     * Encrypts a given message using a passphrase
     * @param {string} message Message to encrypt
     * @param {string} passphrase User-supplied passphrase
     * @param {Buffer} salt Salt for key derivation
     * @returns {Buffer} Concatenated bytes of nonce and cipher text
     */
    export function encryptMessage(message: string, passphrase: string, salt: Buffer) : Buffer {
        const passwordStrength = getPasswordStrength(passphrase);
        if (passwordStrength < 3) {
            throw new Error('The password strength should not be less than 3.');
        }
        const messageBytes = sodiumsumo.from_string(message);
        const keyBytes = sodiumsumo.crypto_pwhash(
            sodiumsumo.crypto_box_SEEDBYTES,
            passphrase,
            salt,
            sodiumsumo.crypto_pwhash_OPSLIMIT_INTERACTIVE,
            sodiumsumo.crypto_pwhash_MEMLIMIT_INTERACTIVE,
            sodiumsumo.crypto_pwhash_ALG_DEFAULT
        );
        const nonce = Buffer.from(sodiumsumo.randombytes_buf(sodiumsumo.crypto_box_NONCEBYTES));
        const cipherText = Buffer.from(sodiumsumo.crypto_secretbox_easy(messageBytes, nonce, keyBytes));

        return Buffer.concat([nonce, cipherText]);
    }

    /**
     * Decrypts a given message using a passphrase
     * @param {Buffer} nonce_and_ciphertext Concatenated bytes of nonce and cipher text
     * @param {string} passphrase User-supplied passphrase
     * @param {Buffer} salt Salt for key derivation
     * @returns {string} Decrypted message
     */
    export function decryptMessage(nonce_and_ciphertext: Buffer, passphrase: string, salt: Buffer) : string {
        const keyBytes = sodiumsumo.crypto_pwhash(
            sodiumsumo.crypto_box_SEEDBYTES,
            passphrase,
            salt,
            sodiumsumo.crypto_pwhash_OPSLIMIT_INTERACTIVE,
            sodiumsumo.crypto_pwhash_MEMLIMIT_INTERACTIVE,
            sodiumsumo.crypto_pwhash_ALG_DEFAULT
        );
        if (nonce_and_ciphertext.length < sodiumsumo.crypto_secretbox_NONCEBYTES + sodiumsumo.crypto_secretbox_MACBYTES) {
            throw new Error("The cipher text is of insufficient length");
        }
        const nonce = nonce_and_ciphertext.slice(0, sodiumsumo.crypto_secretbox_NONCEBYTES);
        const ciphertext = nonce_and_ciphertext.slice(sodiumsumo.crypto_secretbox_NONCEBYTES);
        return sodiumsumo.crypto_secretbox_open_easy(ciphertext, nonce, keyBytes, 'text');
    }

    export function simpleHash(payload: Buffer, length: number) : Buffer {
        return sodiumsumo.crypto_generichash(length, payload);
    }

    /**
     * Checking the password strength using zxcvbn
     * @returns {number} Password score
     */
    export function getPasswordStrength(password: string) : number {
        const results = zxcvbn(password);
        return results.score;
    }

    export function generateKeys(seed: string) {
        const key_pair = sodiumsumo.crypto_sign_seed_keypair(seed, '');

        return { privateKey: key_pair.privateKey, publicKey: key_pair.publicKey };
    }

    export function signDetached(payload: Buffer, privateKey: Buffer) : Buffer {
        return sodiumsumo.crypto_sign_detached(payload, privateKey);
    }
}
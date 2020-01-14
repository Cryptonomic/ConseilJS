import * as blakejs from 'blakejs';
import bigInt from 'big-integer';
import zxcvbn from 'zxcvbn'; // TODO: remove, should be added in the implementing app
const wrapper = require('./WrapperWrapper');

/**
 * Tezos cryptography helpers for the ed25519 curve.
 */
export namespace CryptoUtils {
    /**
     * Generates a salt for key derivation.
     * 
     * @returns {Promise<Buffer>} Salt
     */
    export async function generateSaltForPwHash() : Promise<Buffer> {
        const s = await wrapper.salt();
        return s;
    }

    /**
     * Encrypts a given message using a passphrase
     * 
     * @param {string} message Message to encrypt
     * @param {string} passphrase User-supplied passphrase
     * @param {Buffer} salt Salt for key derivation
     * @returns {Buffer} Concatenated bytes of nonce and cipher text
     */
    export async function encryptMessage(message: string, passphrase: string, salt: Buffer) : Promise<Buffer> {
        const passwordStrength = getPasswordStrength(passphrase);
        if (passwordStrength < 3) { throw new Error('The password strength should not be less than 3.'); }

        const messageBytes = Buffer.from(message);
        const keyBytes = await wrapper.pwhash(passphrase, salt)
        const n = await wrapper.nonce();
        const nonce = Buffer.from(n);
        const s = await wrapper.close(messageBytes, nonce, keyBytes);
        const cipherText = Buffer.from(s);

        return Buffer.concat([nonce, cipherText]);
    }

    /**
     * Decrypts a given message using a passphrase
     * 
     * @param {Buffer} nonce_and_ciphertext Concatenated bytes of nonce and cipher text
     * @param {string} passphrase User-supplied passphrase
     * @param {Buffer} salt Salt for key derivation
     * @returns {string} Decrypted message
     */
    export async function decryptMessage(nonce_and_ciphertext: Buffer, passphrase: string, salt: Buffer) : Promise<string> {
        const keyBytes = await wrapper.pwhash(passphrase, salt)
        const m = await wrapper.open(nonce_and_ciphertext, keyBytes);
        return Buffer.from(m).toString();
    }

    /**
     * Computes a BLAKE2b message hash of the requested length.
     */
    export function simpleHash(payload: Buffer, length: number) : Buffer {
        return Buffer.from(blakejs.blake2b(payload, null, length)); // Same as libsodium.crypto_generichash
    }

    /**
     * Checking the password strength using zxcvbn
     * 
     * @returns {number} Password score
     */
    export function getPasswordStrength(password: string) : number {
        const results = zxcvbn(password);
        return results.score;
    }

    /**
     * Generate key pair from seed.
     * 
     * @param seed 
     */
    export async function generateKeys(seed: Buffer) {
        const k = await wrapper.keys(seed);

        return { privateKey: k.privateKey, publicKey: k.publicKey };
    }

    /**
     * Generate key pair from secret key by recovering the seed.
     * 
     * @param secretKey 
     */
    export async function recoverPublicKey(secretKey: Buffer) {
        const k = await wrapper.publickey(secretKey);

        return { privateKey: k.privateKey, publicKey: k.publicKey };
    }

    /**
     * Sign arbitrary bytes with a secret key.
     * 
     * @param payload 
     * @param secretKey 
     */
    export async function signDetached(payload: Buffer, secretKey: Buffer) : Promise<Buffer> {
        const b = await wrapper.sign(payload, secretKey)
        return Buffer.from(b);
    }

    export function twoByteHex(n: number) : string {
        if (n < 128) { return ('0' + n.toString(16)).slice(-2); }

        let h = '';
        if (n > 2147483648) {
            let r = bigInt(n);
            while (r.greater(0)) {
                h = ('0' + (r.and(127)).toString(16)).slice(-2) + h;
                r = r.shiftRight(7);
            }
        } else {
            let r = n;
            while (r > 0) {
                h = ('0' + (r & 127).toString(16)).slice(-2) + h;
                r = r >> 7;
            }
        }

        return h;
    }

    export function fromByteHex(s: string) : number {
        if (s.length === 2) { return parseInt(s, 16); }

        if (s.length <= 8) {
            let n = parseInt(s.slice(-2), 16);

            for (let i = 1; i < s.length / 2; i++) {
                n += parseInt(s.slice(-2 * i - 2, -2 * i), 16) << (7 * i);
            }

            return n;
        }

        let n = bigInt(parseInt(s.slice(-2), 16));

        for (let i = 1; i < s.length / 2; i++) {
            n = n.add(bigInt(parseInt(s.slice(-2 * i - 2, -2 * i), 16)).shiftLeft(7 * i));
        }

        return n.toJSNumber();
    }
}

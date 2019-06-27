/**
 * This file is not meant for public use. It hides libsodium-wrappers from the Typescript transpiler.
 */
const sodiumsumo = require('libsodium-wrappers-sumo');

const rand = async (length) => {
    await sodiumsumo.ready;
    return sodiumsumo.randombytes_buf(length);
}

const salt = async () => {
    return rand(sodiumsumo.crypto_pwhash_SALTBYTES);
}

const nonce = async () => {
    return rand(sodiumsumo.crypto_box_NONCEBYTES);
}

const keys = async (seed) => {
    await sodiumsumo.ready;
    return sodiumsumo.crypto_sign_seed_keypair(seed, '');
}

const publickey = async (sk) => {
    await sodiumsumo.ready;
    const seed = sodiumsumo.crypto_sign_ed25519_sk_to_seed(sk)
    return sodiumsumo.crypto_sign_seed_keypair(seed, '');
}

const pwhash = async (passphrase, salt) => {
    await sodiumsumo.ready;
    return sodiumsumo.crypto_pwhash(sodiumsumo.crypto_box_SEEDBYTES, passphrase, salt, 4, 33554432, sodiumsumo.crypto_pwhash_ALG_ARGON2I13);
}

const close = async (message, nonce, key) => {
    await sodiumsumo.ready;
    return sodiumsumo.crypto_secretbox_easy(message, nonce, key);
}

const open = async (nonce_and_ciphertext, key) => {
    await sodiumsumo.ready;

    const nonce = nonce_and_ciphertext.slice(0, sodiumsumo.crypto_secretbox_NONCEBYTES);
    const ciphertext = nonce_and_ciphertext.slice(sodiumsumo.crypto_secretbox_NONCEBYTES);

    return sodiumsumo.crypto_secretbox_open_easy(ciphertext, nonce, key);
}

const sign = async (message, key) => {
    await sodiumsumo.ready;
    return sodiumsumo.crypto_sign_detached(message, key);
}

module.exports = {salt, nonce, keys, publickey, pwhash, close, open, sign};

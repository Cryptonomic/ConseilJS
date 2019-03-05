"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const sodiumsumo = require('libsodium-wrappers-sumo');
var SodiumWrapper;
(function (SodiumWrapper) {
    SodiumWrapper.rand = (length) => __awaiter(this, void 0, void 0, function* () {
        yield sodiumsumo.ready;
        return sodiumsumo.randombytes_buf(length);
    });
    SodiumWrapper.salt = () => __awaiter(this, void 0, void 0, function* () {
        return SodiumWrapper.rand(sodiumsumo.crypto_pwhash_SALTBYTES);
    });
    SodiumWrapper.nonce = () => __awaiter(this, void 0, void 0, function* () {
        return SodiumWrapper.rand(sodiumsumo.crypto_box_NONCEBYTES);
    });
    SodiumWrapper.keys = (seed) => __awaiter(this, void 0, void 0, function* () {
        yield sodiumsumo.ready;
        return sodiumsumo.crypto_sign_seed_keypair(seed, '');
    });
    SodiumWrapper.pwhash = (passphrase, salt) => __awaiter(this, void 0, void 0, function* () {
        yield sodiumsumo.ready;
        return sodiumsumo.crypto_pwhash(sodiumsumo.crypto_box_SEEDBYTES, passphrase, salt, sodiumsumo.crypto_pwhash_OPSLIMIT_INTERACTIVE, sodiumsumo.crypto_pwhash_MEMLIMIT_INTERACTIVE, sodiumsumo.crypto_pwhash_ALG_DEFAULT);
    });
    SodiumWrapper.close = (message, nonce, key) => __awaiter(this, void 0, void 0, function* () {
        yield sodiumsumo.ready;
        return sodiumsumo.crypto_secretbox_easy(message, nonce, key);
    });
    SodiumWrapper.open = (nonce_and_ciphertext, key) => __awaiter(this, void 0, void 0, function* () {
        yield sodiumsumo.ready;
        if (nonce_and_ciphertext.length < sodiumsumo.crypto_secretbox_NONCEBYTES + sodiumsumo.crypto_secretbox_MACBYTES) {
            throw new Error('The cipher text is of insufficient length');
        }
        const nonce = nonce_and_ciphertext.slice(0, sodiumsumo.crypto_secretbox_NONCEBYTES);
        const ciphertext = nonce_and_ciphertext.slice(sodiumsumo.crypto_secretbox_NONCEBYTES);
        return sodiumsumo.crypto_secretbox_open_easy(ciphertext, nonce, key);
    });
    SodiumWrapper.sign = (message, key) => __awaiter(this, void 0, void 0, function* () {
        yield sodiumsumo.ready;
        return sodiumsumo.crypto_sign_detached(message, key);
    });
})(SodiumWrapper = exports.SodiumWrapper || (exports.SodiumWrapper = {}));
//# sourceMappingURL=WrapperWrapper.js.map
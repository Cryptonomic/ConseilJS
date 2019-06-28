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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const blakejs = __importStar(require("blakejs"));
const zxcvbn_1 = __importDefault(require("zxcvbn"));
const wrapper = require('./WrapperWrapper');
var CryptoUtils;
(function (CryptoUtils) {
    function generateSaltForPwHash() {
        return __awaiter(this, void 0, void 0, function* () {
            const s = yield wrapper.salt();
            return s;
        });
    }
    CryptoUtils.generateSaltForPwHash = generateSaltForPwHash;
    function encryptMessage(message, passphrase, salt) {
        return __awaiter(this, void 0, void 0, function* () {
            const passwordStrength = getPasswordStrength(passphrase);
            if (passwordStrength < 3) {
                throw new Error('The password strength should not be less than 3.');
            }
            const messageBytes = Buffer.from(message);
            const keyBytes = yield wrapper.pwhash(passphrase, salt);
            const n = yield wrapper.nonce();
            const nonce = Buffer.from(n);
            const s = yield wrapper.close(messageBytes, nonce, keyBytes);
            const cipherText = Buffer.from(s);
            return Buffer.concat([nonce, cipherText]);
        });
    }
    CryptoUtils.encryptMessage = encryptMessage;
    function decryptMessage(nonce_and_ciphertext, passphrase, salt) {
        return __awaiter(this, void 0, void 0, function* () {
            const keyBytes = yield wrapper.pwhash(passphrase, salt);
            const m = yield wrapper.open(nonce_and_ciphertext, keyBytes);
            return Buffer.from(m).toString();
        });
    }
    CryptoUtils.decryptMessage = decryptMessage;
    function simpleHash(payload, length) {
        return Buffer.from(blakejs.blake2b(payload, null, length));
    }
    CryptoUtils.simpleHash = simpleHash;
    function getPasswordStrength(password) {
        const results = zxcvbn_1.default(password);
        return results.score;
    }
    CryptoUtils.getPasswordStrength = getPasswordStrength;
    function generateKeys(seed) {
        return __awaiter(this, void 0, void 0, function* () {
            const k = yield wrapper.keys(seed);
            return { privateKey: k.privateKey, publicKey: k.publicKey };
        });
    }
    CryptoUtils.generateKeys = generateKeys;
    function recoverPublicKey(secretKey) {
        return __awaiter(this, void 0, void 0, function* () {
            const k = yield wrapper.publickey(secretKey);
            return { privateKey: k.privateKey, publicKey: k.publicKey };
        });
    }
    CryptoUtils.recoverPublicKey = recoverPublicKey;
    function signDetached(payload, secretKey) {
        return __awaiter(this, void 0, void 0, function* () {
            const b = yield wrapper.sign(payload, secretKey);
            return Buffer.from(b);
        });
    }
    CryptoUtils.signDetached = signDetached;
})(CryptoUtils = exports.CryptoUtils || (exports.CryptoUtils = {}));
//# sourceMappingURL=CryptoUtils.js.map
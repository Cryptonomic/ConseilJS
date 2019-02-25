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
const fs = __importStar(require("fs"));
const CryptoUtils_1 = require("../../utils/CryptoUtils");
const TezosMessageUtil_1 = require("../../chain/tezos/TezosMessageUtil");
var TezosFileWallet;
(function (TezosFileWallet) {
    function saveWallet(filename, wallet, passphrase) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise(((resolve, reject) => {
                const keys = JSON.stringify(wallet.identities);
                const salt = CryptoUtils_1.CryptoUtils.generateSaltForPwHash();
                let encryptedKeys;
                try {
                    encryptedKeys = CryptoUtils_1.CryptoUtils.encryptMessage(keys, passphrase, salt);
                }
                catch (err) {
                    reject(err);
                }
                const encryptedWallet = {
                    version: '1',
                    salt: TezosMessageUtil_1.TezosMessageUtils.readBufferWithHint(salt, ''),
                    ciphertext: TezosMessageUtil_1.TezosMessageUtils.readBufferWithHint(encryptedKeys, ''),
                    kdf: 'Argon2'
                };
                try {
                    fs.writeFile(filename, JSON.stringify(encryptedWallet), err => {
                        if (err) {
                            reject(err);
                        }
                        resolve(loadWallet(filename, passphrase));
                    });
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    TezosFileWallet.saveWallet = saveWallet;
    function loadWallet(filename, passphrase) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                fs.readFile(filename, (err, data) => {
                    if (err) {
                        reject(err);
                    }
                    const encryptedWallet = JSON.parse(data.toString());
                    const encryptedKeys = TezosMessageUtil_1.TezosMessageUtils.writeBufferWithHint(encryptedWallet.ciphertext);
                    const salt = TezosMessageUtil_1.TezosMessageUtils.writeBufferWithHint(encryptedWallet.salt);
                    try {
                        const keys = JSON.parse(CryptoUtils_1.CryptoUtils.decryptMessage(encryptedKeys, passphrase, salt));
                        resolve({ identities: keys });
                    }
                    catch (e) {
                        reject(e);
                    }
                });
            });
        });
    }
    TezosFileWallet.loadWallet = loadWallet;
    function createWallet(filename, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const wallet = { identities: [] };
            yield saveWallet(filename, wallet, password);
            return wallet;
        });
    }
    TezosFileWallet.createWallet = createWallet;
})(TezosFileWallet = exports.TezosFileWallet || (exports.TezosFileWallet = {}));
//# sourceMappingURL=TezosFileWallet.js.map
"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const bip39 = __importStar(require("bip39"));
const TezosMessageUtil_1 = require("../../chain/tezos/TezosMessageUtil");
const KeyStore_1 = require("../../types/wallet/KeyStore");
const CryptoUtils_1 = require("../../utils/CryptoUtils");
var TezosWalletUtil;
(function (TezosWalletUtil) {
    function unlockFundraiserIdentity(mnemonic, email, password, pkh) {
        return getKeysFromMnemonicAndPassphrase(mnemonic, email + password, pkh, true, KeyStore_1.StoreType.Fundraiser);
    }
    TezosWalletUtil.unlockFundraiserIdentity = unlockFundraiserIdentity;
    function generateMnemonic() {
        return bip39.generateMnemonic(160);
    }
    TezosWalletUtil.generateMnemonic = generateMnemonic;
    function unlockIdentityWithMnemonic(mnemonic, passphrase) {
        return getKeysFromMnemonicAndPassphrase(mnemonic, passphrase, "", false, KeyStore_1.StoreType.Mnemonic);
    }
    TezosWalletUtil.unlockIdentityWithMnemonic = unlockIdentityWithMnemonic;
    function getKeysFromMnemonicAndPassphrase(mnemonic, passphrase, pkh = '', checkPKH = true, storeType) {
        if (mnemonic.split(' ').length !== 15) {
            return { error: "The mnemonic should be 15 words." };
        }
        if (!bip39.validateMnemonic(mnemonic)) {
            return { error: "The given mnemonic could not be validated." };
        }
        const seed = bip39.mnemonicToSeed(mnemonic, passphrase).slice(0, 32);
        const key_pair = CryptoUtils_1.CryptoUtils.generateKeys(seed);
        const privateKey = TezosMessageUtil_1.TezosMessageUtils.readKeyWithHint(key_pair.privateKey, "edsk");
        const publicKey = TezosMessageUtil_1.TezosMessageUtils.readKeyWithHint(key_pair.publicKey, "edpk");
        const publicKeyHash = TezosMessageUtil_1.TezosMessageUtils.computeKeyHash(key_pair.publicKey, 'tz1');
        if (checkPKH && publicKeyHash !== pkh) {
            return { error: "The given mnemonic and passphrase do not correspond to the applied public key hash" };
        }
        return { publicKey, privateKey, publicKeyHash, seed, storeType };
    }
    TezosWalletUtil.getKeysFromMnemonicAndPassphrase = getKeysFromMnemonicAndPassphrase;
})(TezosWalletUtil = exports.TezosWalletUtil || (exports.TezosWalletUtil = {}));
//# sourceMappingURL=TezosWalletUtil.js.map
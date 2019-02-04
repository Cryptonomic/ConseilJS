"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const KeyStore_1 = require("../../types/wallet/KeyStore");
const CryptoUtils = __importStar(require("../../utils/CryptoUtils"));
var TezosWalletUtil;
(function (TezosWalletUtil) {
    function unlockFundraiserIdentity(mnemonic, email, password, pkh) {
        return CryptoUtils.getKeysFromMnemonicAndPassphrase(mnemonic, email + password, pkh, true, KeyStore_1.StoreType.Fundraiser);
    }
    TezosWalletUtil.unlockFundraiserIdentity = unlockFundraiserIdentity;
    function generateMnemonic() {
        return CryptoUtils.generateMnemonic();
    }
    TezosWalletUtil.generateMnemonic = generateMnemonic;
    function unlockIdentityWithMnemonic(mnemonic, passphrase) {
        return CryptoUtils.getKeysFromMnemonicAndPassphrase(mnemonic, passphrase, "", false, KeyStore_1.StoreType.Mnemonic);
    }
    TezosWalletUtil.unlockIdentityWithMnemonic = unlockIdentityWithMnemonic;
})(TezosWalletUtil = exports.TezosWalletUtil || (exports.TezosWalletUtil = {}));
//# sourceMappingURL=TezosWalletUtil.js.map
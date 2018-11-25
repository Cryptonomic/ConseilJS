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
const ledgerUtils = __importStar(require("../utils/LedgerUtils"));
const CryptoUtils_1 = require("../utils/CryptoUtils");
const sodium = __importStar(require("libsodium-wrappers-sumo"));
const KeyStore_1 = require("../types/KeyStore");
var TezosHardwareWallet;
(function (TezosHardwareWallet) {
    function unlockAddress(deviceType, derivationPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const hexEncodedPublicKey = yield ledgerUtils.getTezosPublicKey(derivationPath);
            //We slice off a byte to make sure we have a 64 bits coming in from the ledger package
            const publicKeyBytes = sodium.from_hex(hexEncodedPublicKey).slice(1);
            const publicKey = CryptoUtils_1.base58CheckEncode(publicKeyBytes, "edpk");
            const publicKeyHash = CryptoUtils_1.base58CheckEncode(sodium.crypto_generichash(20, publicKeyBytes), "tz1");
            return {
                publicKey: publicKey,
                privateKey: '',
                publicKeyHash: publicKeyHash,
                seed: '',
                storeType: KeyStore_1.StoreType.Hardware
            };
        });
    }
    TezosHardwareWallet.unlockAddress = unlockAddress;
    function initLedgerTransport() {
        ledgerUtils.initLedgerTransport();
    }
    TezosHardwareWallet.initLedgerTransport = initLedgerTransport;
    function getTezosPublicKey(derivationPath) {
        return ledgerUtils.getTezosPublicKeyOnHidden(derivationPath);
    }
    TezosHardwareWallet.getTezosPublicKey = getTezosPublicKey;
})(TezosHardwareWallet = exports.TezosHardwareWallet || (exports.TezosHardwareWallet = {}));
//# sourceMappingURL=TezosHardwareWallet.js.map
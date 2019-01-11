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
const Trezor_1 = require("./Trezor");
const bs58check = __importStar(require("bs58check"));
const sodium = __importStar(require("libsodium-wrappers"));
function getBranch(enc) {
    return bs58check.decode(enc).slice(2);
}
/**
 * Given a BIP44 derivation path for Tezos, get the Tezos Public Key
 * @param derivationPath BIP44 Derivation Path
 */
function getTezosPublicKey(derivationPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield Trezor_1.TezFns.getAddress(derivationPath, true);
        console.log('address', result.address);
        const hexEncodedPublicKey = result.publicKey;
        return hexEncodedPublicKey;
    });
}
exports.getTezosPublicKey = getTezosPublicKey;
function signTezosOperation(derivationPath, forgedOperation, operations) {
    return __awaiter(this, void 0, void 0, function* () {
        const [revealOp, operation] = operations;
        const branch = getBranch(forgedOperation);
        console.log('aaaaaaaaaaaaaaaaa', branch);
        console.log('bbbbbbbbb', operation);
        const result = yield Trezor_1.TezFns.sign(derivationPath, branch, operation, revealOp);
        const hexEncodedSignature = result.signature;
        const signatureBytes = sodium.from_hex(hexEncodedSignature);
        return signatureBytes;
    });
}
exports.signTezosOperation = signTezosOperation;
//# sourceMappingURL=TrezorUtils.js.map
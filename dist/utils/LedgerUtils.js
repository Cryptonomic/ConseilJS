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
const sodium = __importStar(require("libsodium-wrappers-sumo"));
let Transport = require("@ledgerhq/hw-transport-node-hid").default;
let App = require("basil-tezos-ledger").default;
class TransportInstance {
    static getInstance() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.transport === null) {
                this.transport = yield Transport.create();
            }
            return this.transport;
        });
    }
}
TransportInstance.transport = null;
function initLedgerTransport() {
    TransportInstance.transport = null;
}
exports.initLedgerTransport = initLedgerTransport;
function getTezosPublicKey(derivationPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const transport = yield TransportInstance.getInstance();
        const xtz = new App(transport);
        const result = yield xtz.getAddress(derivationPath, true);
        const hexEncodedPublicKey = result.publicKey;
        return hexEncodedPublicKey;
    });
}
exports.getTezosPublicKey = getTezosPublicKey;
function signTezosOperation(derivationPath, watermarkedOpInHex) {
    return __awaiter(this, void 0, void 0, function* () {
        const transport = yield TransportInstance.getInstance();
        const xtz = new App(transport);
        const result = yield xtz.signOperation(derivationPath, watermarkedOpInHex);
        const hexEncodedSignature = result.signature;
        const signatureBytes = sodium.from_hex(hexEncodedSignature);
        return signatureBytes;
    });
}
exports.signTezosOperation = signTezosOperation;
//# sourceMappingURL=LedgerUtils.js.map
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
const prefix = {
    tz1: new Uint8Array([6, 161, 159]),
    tz2: new Uint8Array([6, 161, 161]),
    tz3: new Uint8Array([6, 161, 164]),
    KT: new Uint8Array([2, 90, 121]),
    edpk: new Uint8Array([13, 15, 37, 217]),
    edsk2: new Uint8Array([13, 15, 58, 7]),
    spsk: new Uint8Array([17, 162, 224, 201]),
    p2sk: new Uint8Array([16, 81, 238, 189]),
    sppk: new Uint8Array([3, 254, 226, 86]),
    p2pk: new Uint8Array([3, 178, 139, 127]),
    edesk: new Uint8Array([7, 90, 60, 179, 41]),
    edsk: new Uint8Array([43, 246, 78, 7]),
    edsig: new Uint8Array([9, 245, 205, 134, 18]),
    spsig1: new Uint8Array([13, 115, 101, 19, 63]),
    p2sig: new Uint8Array([54, 240, 44, 52]),
    sig: new Uint8Array([4, 130, 43]),
    Net: new Uint8Array([87, 82, 0]),
    nce: new Uint8Array([69, 220, 169]),
    b: new Uint8Array([1, 52]),
    o: new Uint8Array([5, 116]),
    Lo: new Uint8Array([133, 233]),
    LLo: new Uint8Array([29, 159, 109]),
    P: new Uint8Array([2, 170]),
    Co: new Uint8Array([79, 179]),
    id: new Uint8Array([153, 103]),
};
var Utility;
(function (Utility) {
    Utility.mergebuf = (b1, b2) => {
        const r = new Uint8Array(b1.length + b2.length);
        r.set(b1);
        r.set(b2, b1.length);
        return r;
    };
    Utility.b58cdecode = (enc, prefix) => {
        return bs58check.decode(enc).slice(prefix.length);
    };
    Utility.buf2hex = (buffer) => {
        const byteArray = new Uint8Array(buffer);
        const hexParts = [];
        for (let i = 0; i < byteArray.length; i++) {
            let hex = byteArray[i].toString(16);
            let paddedHex = ('00' + hex).slice(-2);
            hexParts.push(paddedHex);
        }
        return hexParts.join('');
    };
    Utility.hex2buf = (hex) => {
        return new Uint8Array(hex.match(/[\da-f]{2}/gi).map(h => parseInt(h, 16)));
    };
    Utility.getSource = (address) => {
        const tag = (address[0] == 't' ? 0 : 1);
        const curve = (parseInt(address[2]) - 1);
        const pp = (tag == 1 ? prefix.KT : prefix[`tz${curve + 1}`]);
        var bytes = Utility.b58cdecode(address, pp);
        if (tag == 1) {
            bytes = Utility.mergebuf(bytes, [0]);
        }
        else {
            bytes = Utility.mergebuf([curve], bytes);
        }
        return {
            tag: tag,
            hash: bytes
        };
    };
    Utility.getParameter = (address, opbytes) => {
        const tag = (address[0] == 't' ? 0 : 1);
        const curve = (parseInt(address[2]) - 1);
        const pp = (tag == 1 ? prefix.KT : prefix["tz" + (curve + 1)]);
        let bytes = Utility.b58cdecode(address, pp);
        if (tag == 1) {
            bytes = Utility.mergebuf(bytes, [0]);
        }
        else {
            bytes = Utility.mergebuf([curve], bytes);
        }
        const hex = Utility.buf2hex(Utility.mergebuf([tag], bytes));
        return (opbytes.substr(-46) == hex + "00" ? false : Utility.hex2buf(opbytes.substr(opbytes.indexOf(hex) + hex.length + 2)));
    };
    Utility.getOperations = (ops, forgedOperation) => {
        let operations = [];
        let revealOp;
        for (let i = 0; i < ops.length; i++) {
            const op = ops[i];
            if (op.kind == "reveal") {
                if (revealOp)
                    throw "Can't have 2 reveals";
                revealOp = {
                    source: Utility.getSource(op.source),
                    fee: parseInt(op.fee),
                    counter: parseInt(op.counter),
                    gasLimit: parseInt(op.gas_limit),
                    storageLimit: parseInt(op.storage_limit),
                    publicKey: Utility.mergebuf([0], Utility.b58cdecode(op.public_key, prefix.edpk)),
                };
            }
            else {
                if (['origination', 'transaction', 'delegation'].indexOf(op.kind) < 0)
                    return console.log("err2");
                const op2 = {
                    type: op.kind,
                    source: Utility.getSource(op.source),
                    fee: parseInt(op.fee),
                    counter: parseInt(op.counter),
                    gasLimit: parseInt(op.gas_limit),
                    storageLimit: parseInt(op.storage_limit),
                };
                switch (op.kind) {
                    case 'transaction':
                        op2.amount = parseInt(op.amount);
                        op2.destination = Utility.getSource(op.destination);
                        const p = Utility.getParameter(op.destination, forgedOperation);
                        if (p)
                            op2.parameters = p;
                        break;
                    case 'origination':
                        op2.managerPubkey = Utility.getSource(op.managerPubkey).hash;
                        op2.balance = parseInt(op.balance);
                        op2.spendable = op.spendable;
                        op2.delegatable = op.delegatable;
                        if (typeof op.delegate != 'undefined') {
                            op2.delegate = Utility.getSource(op.delegate).hash;
                        }
                        //Script not supported yet...
                        break;
                    case "delegation":
                        if (typeof op.delegate != 'undefined') {
                            op2.delegate = Utility.getSource(op.delegate).hash;
                        }
                        break;
                }
                operations.push(op2);
            }
        }
        if (operations.length > 1)
            return console.log("Too many operations");
        return [operations[0], revealOp];
    };
})(Utility = exports.Utility || (exports.Utility = {}));
/**
 * Given a BIP44 derivation path for Tezos, get the Tezos Public Key
 * @param derivationPath BIP44 Derivation Path
 */
function getTezosPublicKey(derivationPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield Trezor_1.TezFns.getAddress(derivationPath, true);
        return result;
    });
}
exports.getTezosPublicKey = getTezosPublicKey;
function signTezosOperation(derivationPath, operations, hash, forgedOperation) {
    return __awaiter(this, void 0, void 0, function* () {
        const newOps = Utility.getOperations(operations, forgedOperation);
        const branch = Utility.b58cdecode(hash, prefix.b);
        const result = yield Trezor_1.TezFns.sign(derivationPath, branch, newOps[0], newOps[1]);
        return {
            bytes: result.sigOpContents,
            signature: result.signature
        };
    });
}
exports.signTezosOperation = signTezosOperation;
//# sourceMappingURL=TrezorUtils.js.map
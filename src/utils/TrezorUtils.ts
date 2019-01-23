import {TezFns} from './Trezor';

import * as bs58check from 'bs58check';
import * as sodium from 'libsodium-wrappers';

const prefix = {
    tz1: new Uint8Array([6, 161, 159]),
    tz2: new Uint8Array([6, 161, 161]),
    tz3: new Uint8Array([6, 161, 164]),
    KT: new Uint8Array([2, 90, 121]),
    
    
    edpk: new Uint8Array([13, 15, 37, 217]),
    edsk2: new Uint8Array([13, 15, 58, 7]),
    spsk: new Uint8Array([17, 162, 224, 201]),
    p2sk: new Uint8Array([16,81,238,189]),
    
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
    b: new Uint8Array([1,52]),
    o: new Uint8Array([5, 116]),
    Lo: new Uint8Array([133, 233]),
    LLo: new Uint8Array([29, 159, 109]),
    P: new Uint8Array([2, 170]),
    Co: new Uint8Array([79, 179]),
    id: new Uint8Array([153, 103]),
}

export namespace Utility {
    export const mergebuf = (b1, b2) => {
        const r = new Uint8Array(b1.length + b2.length);
        r.set(b1);
        r.set(b2, b1.length);
        return r;
    }

    export const b58cdecode = (enc, prefix) => { 
        return bs58check.decode(enc).slice(prefix.length);
    }

    export const buf2hex = (buffer) => {
        const byteArray = new Uint8Array(buffer);
        const hexParts: any[] = [];
        for (let i = 0; i < byteArray.length; i++) {
          let hex = byteArray[i].toString(16);
          let paddedHex = ('00' + hex).slice(-2);
          hexParts.push(paddedHex);
        }
        return hexParts.join('');
      };

    export const hex2buf = (hex) => {
          return new Uint8Array(hex.match(/[\da-f]{2}/gi).map(h => parseInt(h, 16)));
      }

    export const getSource = (address: string) => {
        const tag = (address[0] == 't' ? 0 : 1);
        const curve = (parseInt(address[2])-1);
        const pp = (tag == 1 ? prefix.KT : prefix[`tz${curve+1}`]);
        var bytes = b58cdecode(address, pp);
        if (tag == 1) {
            bytes = mergebuf(bytes, [0])
        } else {					
            bytes = mergebuf([curve], bytes)
        }
        return {
            tag: tag,
            hash : bytes
        };
    }

    export const getParameter = (address, opbytes) => {
        const tag = (address[0] == 't' ? 0 : 1);
        const curve = (parseInt(address[2])-1);
        const pp = (tag == 1 ? prefix.KT : prefix["tz"+(curve+1)]);
        let bytes = b58cdecode(address, pp);
        if (tag == 1) {
            bytes = mergebuf(bytes, [0])
        } else {					
            bytes = mergebuf([curve], bytes)
        }
        const hex = buf2hex(mergebuf([tag], bytes));
        return (opbytes.substr(-46) == hex + "00" ? false : hex2buf(opbytes.substr(opbytes.indexOf(hex)+hex.length+2)));
    }

    export const getOperations = (ops, forgedOperation) => {
        let operations: any[] = [];
        let revealOp;
        for (let i = 0; i < ops.length; i++) {
            const op = ops[i];
            if (op.kind == "reveal"){
                if (revealOp) throw "Can't have 2 reveals";
                revealOp = {
                    source : getSource(op.source),
                    fee : parseInt(op.fee),
                    counter : parseInt(op.counter),
                    gasLimit : parseInt(op.gas_limit),
                    storageLimit : parseInt(op.storage_limit),
                    publicKey : mergebuf([0], b58cdecode(op.public_key, prefix.edpk)),
                };
            } else {
                if (['origination', 'transaction', 'delegation'].indexOf(op.kind) < 0) return console.log("err2");
                const op2: any = {
                    type : op.kind,
                    source : getSource(op.source),
                    fee : parseInt(op.fee),
                    counter : parseInt(op.counter),
                    gasLimit : parseInt(op.gas_limit),
                    storageLimit : parseInt(op.storage_limit),
                };
                switch(op.kind){
                    case 'transaction':
                        op2.amount = parseInt(op.amount);
                        op2.destination = getSource(op.destination);
                        const p = getParameter(op.destination, forgedOperation)
                        if (p) op2.parameters = p;
                        break;
                    case 'origination':
                        op2.managerPubkey = getSource(op.managerPubkey).hash;
                        op2.balance = parseInt(op.balance);
                        op2.spendable = op.spendable;
                        op2.delegatable = op.delegatable;
                        if (typeof op.delegate != 'undefined'){
                            op2.delegate = getSource(op.delegate).hash;
                        }
                        //Script not supported yet...
                        break;
                    case "delegation":
                        if (typeof op.delegate != 'undefined'){
                            op2.delegate = getSource(op.delegate).hash;
                        }
                        break;
                }
                operations.push(op2);
            }
        }
        if (operations.length > 1) return console.log("Too many operations");
        return [operations[0], revealOp];
    }
}



/**
 * Given a BIP44 derivation path for Tezos, get the Tezos Public Key
 * @param derivationPath BIP44 Derivation Path
 */
export async function getTezosPublicKey(derivationPath: string): Promise<any> {
    const result: any = await TezFns.getAddress(derivationPath, true);
    return result;
}

export async function signTezosOperation(derivationPath: string, operations: object[], hash: string, forgedOperation: string): Promise<any> {
    const newOps = Utility.getOperations(operations, forgedOperation);
    const branch = Utility.b58cdecode(hash, prefix.b);
    const result: any = await TezFns.sign(derivationPath, branch, newOps[0], newOps[1]);
    return {
        bytes: result.sigOpContents,
        signature: result.signature
    };
}
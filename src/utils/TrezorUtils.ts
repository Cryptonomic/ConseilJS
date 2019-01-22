import {TezFns} from './Trezor';

import * as bs58check from 'bs58check';
import * as sodium from 'libsodium-wrappers';

function getBranch(enc) {
    return bs58check.decode(enc).slice(2);
}

/**
 * Given a BIP44 derivation path for Tezos, get the Tezos Public Key
 * @param derivationPath BIP44 Derivation Path
 */
export async function getTezosPublicKey(derivationPath: string): Promise<any> {
    const result: any = await TezFns.getAddress(derivationPath, true);
    return result;
}

export async function signTezosOperation(derivationPath: string, forgedOperation: string, operations: object[]): Promise<Buffer> {
    const [revealOp, operation] = operations;
    const branch = getBranch(forgedOperation);
    console.log('aaaaaaaaaaaaaaaaa', branch);
    console.log('bbbbbbbbb', operation);
    const result: any = await TezFns.sign(derivationPath, branch, operation, revealOp);
    const hexEncodedSignature = result.signature;
    const signatureBytes = sodium.from_hex(hexEncodedSignature);
    return signatureBytes;
}
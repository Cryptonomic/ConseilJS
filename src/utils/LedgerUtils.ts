import {base58CheckEncode} from "./CryptoUtils";
import * as sodium  from 'libsodium-wrappers-sumo';

let Transport = require("@ledgerhq/hw-transport-node-hid").default;
let App = require("@ledgerhq/hw-app-xtz").default;

export async function getTezosPublicKey(derivationPath: string): Promise<string> {
    const transport = await Transport.create();
    const xtz = new App(transport);
    const result = await xtz.getAddress(derivationPath, true);
    const hexEncodedPublicKey = result.publicKey;
    return hexEncodedPublicKey;
}

export async function signTezosOperation(derivationPath: string, opBytes: Buffer): Promise<Buffer> {
    console.log('Singing using Ledger..')
    const transport = await Transport.create();
    const xtz = new App(transport);
    const opBytesInHex = sodium.to_hex(opBytes);
    //const opBytesInHex = opBytes.toString('hex');
    console.log(opBytesInHex)
    const result = await xtz.signOperation(derivationPath, opBytesInHex);
    const hexEncodedSignature = result.signature;
    const signatureBytes = sodium.from_hex(hexEncodedSignature).slice(1);
    return signatureBytes;
}
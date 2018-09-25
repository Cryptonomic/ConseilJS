import {base58CheckEncode} from "./CryptoUtils";
import * as sodium from 'libsodium-wrappers-sumo';

let Transport = require("@ledgerhq/hw-transport-node-hid").default;
let App = require("@ledgerhq/hw-app-xtz").default;

class LedgerStuff {
    static transport = null;
    static async getInstance() {
        if (this.transport === null) {
            this.transport = await Transport.create();
        }
        return this.transport
    }
}

export async function getTezosPublicKey(derivationPath: string): Promise<string> {
    const transport = await LedgerStuff.getInstance();
    const xtz = new App(transport);
    const result = await xtz.getAddress(derivationPath, true);
    const hexEncodedPublicKey = result.publicKey;
    return hexEncodedPublicKey;
}

export async function signTezosOperation(derivationPath: string, watermarkedOpInHex: string): Promise<Buffer> {
    console.log('Signing using Ledger..')
    const transport = await LedgerStuff.getInstance();
    const xtz = new App(transport);
    const result = await xtz.signOperation(derivationPath, watermarkedOpInHex);//opBytesInHex);
    const hexEncodedSignature = result.signature;
    const signatureBytes = sodium.from_hex(hexEncodedSignature);
    return signatureBytes;
}
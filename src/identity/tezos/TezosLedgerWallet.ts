import Transport from '@ledgerhq/hw-transport-node-hid';

import { TezosMessageUtils } from '../../chain/tezos/TezosMessageUtil';
import { HardwareDeviceType } from "../../types/wallet/HardwareDeviceType";
import { KeyStore, StoreType } from "../../types/wallet/KeyStore";
import TezosLedgerConnector from "../../identity/tezos/TezosLedgerConnector"

/**
 * Current solution to keep global instance of Ledgerjs transport object for signing use.
 */
class TransportInstance {
    static transport = null;
    static async getInstance() {
        if (this.transport === null) {
            this.transport = await Transport.create();
        }
        return this.transport
    }
}

export namespace TezosLedgerWallet {
    export async function unlockAddress(deviceType: HardwareDeviceType, derivationPath: string): Promise<KeyStore> {
        if (deviceType !== HardwareDeviceType.LedgerNanoS) {
            throw new Error("Unsupported hardware device");
        }

        const hexEncodedPublicKey = await getTezosPublicKey(derivationPath);
        //We slice off a byte to make sure we have a 64 bits coming in from the ledger package
        const publicKeyBytes = Buffer.from(hexEncodedPublicKey, 'hex').slice(1);
        const publicKey = TezosMessageUtils.readKeyWithHint(publicKeyBytes, "edpk");
        const publicKeyHash = TezosMessageUtils.computeKeyHash(publicKeyBytes, 'tz1');

        return { publicKey: publicKey, privateKey: '', publicKeyHash: publicKeyHash, seed: '', storeType: StoreType.Hardware, derivationPath };
    }

    /**
     * Given a BIP44 derivation path for Tezos, get the Tezos Public Key
     * 
     * @param derivationPath BIP44 Derivation Path
     */
    export async function getTezosPublicKey(derivationPath: string): Promise<string> {
        const transport = await TransportInstance.getInstance();
        const xtz = new TezosLedgerConnector(transport);
        return xtz.getAddress(derivationPath, true);
    }

    /**
     * Given a BIP44 derivation path for Tezos, and the hex encoded, watermarked Tezos Operation, sign using the ledger
     * 
     * @param derivationPath BIP44 Derivation Path
     * @param watermarkedOpInHex Operation
     */
    export async function signTezosOperation(derivationPath: string, watermarkedOpInHex: string): Promise<Buffer> {
        const transport = await TransportInstance.getInstance();
        const xtz = new TezosLedgerConnector(transport);
        const result = await xtz.signOperation(derivationPath, watermarkedOpInHex);
        const signatureBytes = Buffer.from(result, 'hex');

        return signatureBytes;
    }

    export function initLedgerTransport() {
        TransportInstance.transport = null;
    }
}

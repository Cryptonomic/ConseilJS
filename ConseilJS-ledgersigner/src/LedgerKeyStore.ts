import { KeyStore, KeyStoreCurve, KeyStoreType } from 'conseiljs';
import { TezosMessageUtils } from 'conseiljs';

/**
 * A set of helper functions 
 */
export namespace KeyStoreUtils {
    export async function unlockAddress(derivationPath: string): Promise<KeyStore> {
        const hexEncodedPublicKey = await getTezosPublicKey(derivationPath);
        const publicKeyBytes = Buffer.from(hexEncodedPublicKey, 'hex').slice(1); // We slice off a byte to make sure we have a 64 bits coming in from the ledger package
        const publicKey = TezosMessageUtils.readKeyWithHint(publicKeyBytes, "edpk");
        const publicKeyHash = TezosMessageUtils.computeKeyHash(publicKeyBytes, 'tz1');

        return { publicKey, privateKey: '', publicKeyHash, curve: KeyStoreCurve.ED25519, storeType: KeyStoreType.Hardware, derivationPath };
    }

    /**
     * Given a BIP44 derivation path for Tezos, get the Tezos Public Key
     * 
     * @param derivationPath BIP32/44 derivation path
     */
    export async function getTezosPublicKey(derivationPath: string): Promise<string> {
        const transport = await TransportInstance.getInstance();
        const xtz = new TezosLedgerConnector(transport);
        return xtz.getAddress(derivationPath, true);
    }
}

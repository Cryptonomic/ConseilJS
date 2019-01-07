import {TezFns} from './Trezor';

/**
 * Given a BIP44 derivation path for Tezos, get the Tezos Public Key
 * @param derivationPath BIP44 Derivation Path
 */
export async function getTezosPublicKey(derivationPath: string): Promise<string> {
    const result: any = await TezFns.getAddress(derivationPath, true);
    const hexEncodedPublicKey = result.publicKey;
    return hexEncodedPublicKey;
}
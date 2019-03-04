import * as bip39 from 'bip39';

import {TezosMessageUtils} from '../../chain/tezos/TezosMessageUtil';
import {KeyStore, StoreType} from '../../types/wallet/KeyStore';
import {CryptoUtils} from '../../utils/CryptoUtils'

export namespace TezosWalletUtil {
    /**
     * Unlocks an identity supplied during the 2017 Tezos fundraiser.
     * 
     * @param {string} mnemonic Fifteen word mnemonic phrase from fundraiser PDF.
     * @param {string} email Email address from fundraiser PDF.
     * @param {string} password Password from fundraiser PDF.
     * @param {string} pkh The public key hash supposedly produced by the given mnemonic and passphrase
     * @returns {Promise<KeyStore>} Wallet file
     */
    export async function unlockFundraiserIdentity(mnemonic: string, email: string, password: string, pkh: string) : Promise<KeyStore> {
        return await getKeysFromMnemonicAndPassphrase(mnemonic, email + password, pkh, true, StoreType.Fundraiser);
    }

    /**
     * Generates a fifteen word mnemonic phrase using the BIP39 standard.
     */
    export function generateMnemonic(): string {
        return bip39.generateMnemonic(160)
    }

    /**
     * Generates a key pair based on a mnemonic.
     * 
     * @param {string} mnemonic Fifteen word memonic phrase
     * @param {string} passphrase User-supplied passphrase
     * @returns {Promise<KeyStore>} Unlocked key pair
     */
    export async function unlockIdentityWithMnemonic(mnemonic: string, passphrase: string): Promise<KeyStore> {
        return await getKeysFromMnemonicAndPassphrase(mnemonic, passphrase, '', false, StoreType.Mnemonic);
    }

    /**
     * Generates keys from a user-supplied mnemonic and passphrase.
     * 
     * @param {string} mnemonic Fifteen word mnemonic phrase from fundraiser PDF.
     * @param {string} passphrase User-supplied passphrase
     * @param {string} pkh The public key hash supposedly produced by the given mnemonic and passphrase
     * @param {boolean} checkPKH Check whether presumed public key hash matches the actual public key hash
     * @param {StoreType} storeType Type of the generated key store
     * @returns {Promise<KeyStore>} Generated keys
     */
    export async function getKeysFromMnemonicAndPassphrase(mnemonic: string, passphrase: string, pkh = '', checkPKH = true, storeType: StoreType) : Promise<KeyStore> {
        if (mnemonic.split(' ').length !== 15) { throw new Error('The mnemonic should be 15 words.'); }
        if (!bip39.validateMnemonic(mnemonic)) { throw new Error('The given mnemonic could not be validated.'); }

        const seed = bip39.mnemonicToSeed(mnemonic, passphrase).slice(0, 32);
        const keys = await CryptoUtils.generateKeys(seed);
        const privateKey = TezosMessageUtils.readKeyWithHint(keys.privateKey, 'edsk');
        const publicKey = TezosMessageUtils.readKeyWithHint(keys.publicKey, 'edpk');
        const publicKeyHash = TezosMessageUtils.computeKeyHash(keys.publicKey, 'tz1');

        if (checkPKH && publicKeyHash !== pkh) { throw new Error('The given mnemonic and passphrase do not correspond to the applied public key hash'); }

        return { publicKey, privateKey, publicKeyHash, seed, storeType };
    }
}

import * as bip39 from 'bip39';

import { KeyStore, KeyStoreCurve, KeyStoreType, Signer } from 'conseiljs';
import { TezosMessageUtils } from 'conseiljs';

/**
 * A set of helper functions for managing the Fundraiser and software-generated keys.
 */
export namespace KeyStoreUtils {
    /**
     * 
     * @param strength 
     * @param password 
     * @param signer 
     * @param mnemonic 
     */
    export async function GenerateIdentity(strength: number = 256, password: string = '', signer: Signer, mnemonic?: string): Promise<KeyStore> {
        return RestoreIdentityFromMnemonic((mnemonic || bip39.generateMnemonic(strength)), password, signer);
    }

    /**
     * 
     * 
     * @param privateKey Secret key to restore public key and hash from.
     * @param {Signer} signer Object for performing cryptographic operations.
     */
    export async function RestoreIdentityFromSecretKey(privateKey: string, signer: Signer): Promise<KeyStore> {
        const secretKey = TezosMessageUtils.writeKeyWithHint(privateKey, 'edsk');
        const keys = await signer.recoverKeys(secretKey);

        const publicKey = TezosMessageUtils.readKeyWithHint(keys.publicKey, 'edpk');
        const publicKeyHash = TezosMessageUtils.computeKeyHash(keys.publicKey, 'tz1');

        return { publicKey, privateKey, publicKeyHash, curve: KeyStoreCurve.ED25519, storeType: KeyStoreType.Mnemonic };
    }

    /**
     * 
     * 
     * @param mnemonic 
     * @param password 
     * @param {Signer} signer Object for performing cryptographic operations.
     * @param pkh 
     * @param derivationPath 
     */
    export async function RestoreIdentityFromMnemonic(mnemonic: string, password: string, signer: Signer, pkh?: string, derivationPath?: string): Promise<KeyStore> {
        if (![12, 15, 18, 21, 24].includes(mnemonic.split(' ').length)) { throw new Error('Invalid mnemonic length.'); }
        if (!bip39.validateMnemonic(mnemonic)) { throw new Error('The given mnemonic could not be validated.'); }

        const seed = (await bip39.mnemonicToSeed(mnemonic, password)).slice(0, 32);
        const keys = await signer.generateKeys(seed);
        const privateKey = TezosMessageUtils.readKeyWithHint(keys.secretKey, 'edsk');
        const publicKey = TezosMessageUtils.readKeyWithHint(keys.publicKey, 'edpk');
        const publicKeyHash = TezosMessageUtils.computeKeyHash(keys.publicKey, 'tz1');

        if (!!pkh && publicKeyHash !== pkh) { throw new Error('The given mnemonic and passphrase do not correspond to the supplied public key hash'); }

        return {publicKey, privateKey, publicKeyHash, curve: KeyStoreCurve.ED25519, storeType: KeyStoreType.Mnemonic, seed: mnemonic, derivationPath};
    }

    /**
     * Unlocks an identity supplied during the 2017 Tezos fundraiser.
     * 
     * To get a Tezos test nets account go to https://faucet.tzalpha.net
     * 
     * @param {string} mnemonic Fifteen-word mnemonic phrase from fundraiser PDF.
     * @param {string} email Email address from fundraiser PDF.
     * @param {string} password Password from fundraiser PDF.
     * @param {string} pkh The public key hash supposedly produced by the given mnemonic and passphrase
     * @param {Signer} signer Object for performing cryptographic operations.
     * @returns {Promise<KeyStore>} Wallet file
     */
    export async function RestoreIdentityFromFundraiser(mnemonic: string, email: string, password: string, pkh: string, signer: Signer): Promise<KeyStore> {
        return await RestoreIdentityFromMnemonic(mnemonic, email + password, signer, pkh);
    }
}

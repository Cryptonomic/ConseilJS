import * as bip39 from 'bip39';

import { KeyStore, KeyStoreCurve, KeyStoreType } from 'conseiljs';
import { TezosMessageUtils } from 'conseiljs';

import { CryptoUtils } from './utils/CryptoUtils'

/**
 * A set of helper functions for managing the Fundraiser and software-generated keys.
 */
export namespace KeyStoreUtils {
    /**
     * 
     * @param strength 
     * @param password 
     * @param mnemonic 
     */
    export async function generateIdentity(strength: number = 256, password: string = '', mnemonic?: string): Promise<KeyStore> {
        return restoreIdentityFromMnemonic((mnemonic || bip39.generateMnemonic(strength)), password);
    }

    /**
     * 
     * 
     * @param privateKey Secret key to restore public key and hash from.
     */
    export async function restoreIdentityFromSecretKey(secretKey: string): Promise<KeyStore> {
        const secretKeyBytes = TezosMessageUtils.writeKeyWithHint(secretKey, 'edsk');
        const keys = await recoverKeys(secretKeyBytes);

        const publicKey = TezosMessageUtils.readKeyWithHint(keys.publicKey, 'edpk');
        const publicKeyHash = TezosMessageUtils.computeKeyHash(keys.publicKey, 'tz1');

        return { publicKey, secretKey, publicKeyHash, curve: KeyStoreCurve.ED25519, storeType: KeyStoreType.Mnemonic };
    }

    /**
     * 
     * 
     * @param mnemonic 
     * @param password 
     * @param pkh 
     * @param derivationPath 
     */
    export async function restoreIdentityFromMnemonic(mnemonic: string, password: string, pkh?: string, derivationPath?: string): Promise<KeyStore> {
        if (![12, 15, 18, 21, 24].includes(mnemonic.split(' ').length)) { throw new Error('Invalid mnemonic length.'); }
        if (!bip39.validateMnemonic(mnemonic)) { throw new Error('The given mnemonic could not be validated.'); }

        const seed = (await bip39.mnemonicToSeed(mnemonic, password)).slice(0, 32);
        const keys = await generateKeys(seed);
        const secretKey = TezosMessageUtils.readKeyWithHint(keys.secretKey, 'edsk');
        const publicKey = TezosMessageUtils.readKeyWithHint(keys.publicKey, 'edpk');
        const publicKeyHash = TezosMessageUtils.computeKeyHash(keys.publicKey, 'tz1');

        if (!!pkh && publicKeyHash !== pkh) { throw new Error('The given mnemonic and passphrase do not correspond to the supplied public key hash'); }

        return {publicKey, secretKey, publicKeyHash, curve: KeyStoreCurve.ED25519, storeType: KeyStoreType.Mnemonic, seed: mnemonic, derivationPath};
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
     * @returns {Promise<KeyStore>} Wallet file
     */
    export async function restoreIdentityFromFundraiser(mnemonic: string, email: string, password: string, pkh: string): Promise<KeyStore> {
        return await restoreIdentityFromMnemonic(mnemonic, email + password, pkh);
    }

    /**
     * 
     * @param seed 
     */
    export async function generateKeys(seed: Buffer): Promise<{ publicKey: Buffer, secretKey: Buffer}> {
        const keys = await CryptoUtils.generateKeys(seed);
        return { publicKey: keys.publicKey, secretKey: keys.privateKey };
    }

    export async function recoverKeys(secretKey: Buffer): Promise<{ publicKey: Buffer, secretKey: Buffer}> {
        const keys = await CryptoUtils.recoverPublicKey(secretKey);
        return { publicKey: keys.publicKey, secretKey: keys.privateKey };
    }

    /**
     * 
     * @param message 
     * @param passphrase 
     * @param salt 
     */
    export async function decryptMessage(message: Buffer, passphrase: string, salt: Buffer): Promise<Buffer> {
        return CryptoUtils.decryptMessage(message, passphrase, salt);
    }

    /**
     * 
     * @param message 
     * @param passphrase 
     * @param salt 
     */
    export async function encryptMessage(message: Buffer, passphrase: string, salt: Buffer): Promise<Buffer> {
        return CryptoUtils.encryptMessage(message, passphrase, salt);
    }

    /**
     * Convenience function that uses Tezos nomenclature to check signature of arbitrary text.
     * 
     * @param signature 
     * @param message 
     * @param publicKey 
     * * @returns {Promise<boolean>}
     */
    export async function checkTextSignature(signature: string, message: string, publicKey: string): Promise<boolean> {
        const sig = TezosMessageUtils.writeSignatureWithHint(signature, 'edsig');
        const pk = TezosMessageUtils.writeKeyWithHint(publicKey, 'edpk');

        return await CryptoUtils.checkSignature(sig, Buffer.from(message, 'utf8'), pk);
    }
}

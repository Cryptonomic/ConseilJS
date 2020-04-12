import * as bip39 from 'bip39';

import { TezosMessageUtils } from '../../chain/tezos/TezosMessageUtil';
import { KeyStore, StoreType } from '../../types/wallet/KeyStore';
import { CryptoUtils } from '../../utils/CryptoUtils'

export namespace TezosWalletUtil {
    /**
     * Unlocks an identity supplied during the 2017 Tezos fundraiser.
     * 
     * To get an account for testing on Tezos Alphanet go to https://faucet.tzalpha.net
     * 
     * @param {string} mnemonic Fifteen-word mnemonic phrase from fundraiser PDF.
     * @param {string} email Email address from fundraiser PDF.
     * @param {string} password Password from fundraiser PDF.
     * @param {string} pkh The public key hash supposedly produced by the given mnemonic and passphrase
     * @returns {Promise<KeyStore>} Wallet file
     */
    export async function unlockFundraiserIdentity(mnemonic: string, email: string, password: string, pkh: string): Promise<KeyStore> {
        return await getKeysFromMnemonicAndPassphrase(mnemonic, email + password, StoreType.Fundraiser, pkh);
    }

    /**
     * Recover public key and public key hash (address) given a secret key.
     * 
     * @param keyString A hex representation of a secret key starting with 'edsk'.
     */
    export async function restoreIdentityWithSecretKey(keyString: string): Promise<KeyStore> {
        const secretKey = TezosMessageUtils.writeKeyWithHint(keyString, 'edsk');
        const keys = await CryptoUtils.recoverPublicKey(secretKey);

        const publicKey = TezosMessageUtils.readKeyWithHint(keys.publicKey, 'edpk');
        const publicKeyHash = TezosMessageUtils.computeKeyHash(keys.publicKey, 'tz1');

        return { publicKey, privateKey: keyString, publicKeyHash, seed: '', storeType: StoreType.Mnemonic }
    }

    /**
     * Generates a fifteen word mnemonic phrase using the BIP39 standard.
     * 
     * @param {number} strength Mnemonic strength, defaults to 256/24-words. Tezos fundraiser mnemonics are 160/15-word.
     */
    export function generateMnemonic(strength: number = 256): string {
        return bip39.generateMnemonic(strength)
    }

    /**
     * Generates a key pair based on a mnemonic.
     * 
     * @param {string} mnemonic Fifteen word mnemonic phrase
     * @param {string} passphrase User-supplied passphrase
     * @returns {Promise<KeyStore>} Unlocked key pair
     */
    export async function unlockIdentityWithMnemonic(mnemonic: string, passphrase: string = ''): Promise<KeyStore> {
        return await getKeysFromMnemonicAndPassphrase(mnemonic, passphrase, StoreType.Mnemonic);
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
    export async function getKeysFromMnemonicAndPassphrase(mnemonic: string, passphrase: string, storeType: StoreType, pkh?: string) : Promise<KeyStore> {
        if (![12, 15, 18, 21, 24].includes(mnemonic.split(' ').length)) { throw new Error('Invalid mnemonic length.'); }
        if (!bip39.validateMnemonic(mnemonic)) { throw new Error('The given mnemonic could not be validated.'); }

        const seed = (await bip39.mnemonicToSeed(mnemonic, passphrase)).slice(0, 32);
        const keys = await CryptoUtils.generateKeys(seed);
        const privateKey = TezosMessageUtils.readKeyWithHint(keys.privateKey, 'edsk');
        const publicKey = TezosMessageUtils.readKeyWithHint(keys.publicKey, 'edpk');
        const publicKeyHash = TezosMessageUtils.computeKeyHash(keys.publicKey, 'tz1');

        if (!!pkh && publicKeyHash !== pkh) { throw new Error('The given mnemonic and passphrase do not correspond to the applied public key hash'); }

        return { publicKey, privateKey, publicKeyHash, seed: '', storeType };
    }

    /**
     * Signs arbitrary text using libsodium/ed25519.
     * 
     * @param keyStore Key pair to use for signing
     * @param message UTF-8 test
     * @returns {Promise<KeyStore>} base58check-encoded signature prefixed with 'edsig'
     */
    export async function signText(keyStore: KeyStore, message: string): Promise<string>{
        const privateKey = TezosMessageUtils.writeKeyWithHint(keyStore.privateKey, 'edsk');
        const messageSig = await CryptoUtils.signDetached(Buffer.from(message, 'utf8'), privateKey);
        return TezosMessageUtils.readSignatureWithHint(messageSig, 'edsig');
    }

    /**
     * 
     * @param signature 
     * @param message 
     * @param publicKey 
     * * @returns {Promise<boolean>}
     */
    export async function checkSignature(signature: string, message: string, publicKey): Promise<boolean> {
        const sig = TezosMessageUtils.writeSignatureWithHint(signature, 'edsig');
        const pk = TezosMessageUtils.writeKeyWithHint(publicKey, 'edpk');

        return await CryptoUtils.checkSignature(sig, Buffer.from(message, 'utf8'), pk);
    }
}

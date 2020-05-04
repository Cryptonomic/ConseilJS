import * as fs from "fs";
import * as bip39 from 'bip39';

import { KeyStore, KeyStoreCurve, KeyStoreType, Signer } from 'conseiljs';
import { Wallet, EncryptedWalletVersionOne } from 'conseiljs';
import { TezosMessageUtils } from 'conseiljs';

import { FileKeyStore } from './FileKeyStore';

export namespace FileKeyStoreUtils {
    export async function GenerateIdentity(strength: number = 256, password: string = '', mnemonic?: string): Promise<FileKeyStore> {
        return RestoreIdentityFromMnemonic((mnemonic || bip39.generateMnemonic(strength)), password);
    }

    async function RestoreIdentityFromSecretKey(privateKey: string, signer: Signer): Promise<FileKeyStore> {
        const secretKey = TezosMessageUtils.writeKeyWithHint(privateKey, 'edsk');
        const keys = await signer.recoverPublicKey(secretKey);

        const publicKey = TezosMessageUtils.readKeyWithHint(keys.publicKey, 'edpk');
        const publicKeyHash = TezosMessageUtils.computeKeyHash(keys.publicKey, 'tz1');

        return new FileKeyStore(publicKey, privateKey, publicKeyHash);
    }

    export async function RestoreIdentityFromMnemonic(mnemonic: string, password: string, derivationPath?: string, pkh?: string): Promise<FileKeyStore> {
        if (![12, 15, 18, 21, 24].includes(mnemonic.split(' ').length)) { throw new Error('Invalid mnemonic length.'); }
        if (!bip39.validateMnemonic(mnemonic)) { throw new Error('The given mnemonic could not be validated.'); }

        const seed = (await bip39.mnemonicToSeed(mnemonic, password)).slice(0, 32);
        const keys = await signer.generateKeys(seed);
        const privateKey = TezosMessageUtils.readKeyWithHint(keys.privateKey, 'edsk');
        const publicKey = TezosMessageUtils.readKeyWithHint(keys.publicKey, 'edpk');
        const publicKeyHash = TezosMessageUtils.computeKeyHash(keys.publicKey, 'tz1');

        if (!!pkh && publicKeyHash !== pkh) { throw new Error('The given mnemonic and passphrase do not correspond to the supplied public key hash'); }

        return new FileKeyStore(publicKey, privateKey, publicKeyHash, KeyStoreCurve.ED25519, KeyStoreType.Mnemonic, mnemonic, derivationPath);
    }

    export async function RestoreIdentityFromFile(path: string, password: string, signer: Signer): Promise<FileKeyStore> {
        const p = new Promise<EncryptedWalletVersionOne>((resolve, reject) => {
            fs.readFile(path, (err, data) => {
                if (err) { reject(err); return; }
                const encryptedWallet: EncryptedWalletVersionOne = JSON.parse(data.toString()) as EncryptedWalletVersionOne;
                resolve(encryptedWallet);
            });
        });

        const ew = await p;
        const encryptedKeys = TezosMessageUtils.writeBufferWithHint(ew.ciphertext);
        const salt = TezosMessageUtils.writeBufferWithHint(ew.salt);
        const keys = JSON.parse(await signer.decryptMessage(encryptedKeys, password, salt).toString()) as KeyStore[];

        return new FileKeyStore(keys[0].publicKey, keys[0].privateKey, keys[0].publicKeyHash, KeyStoreCurve.ED25519, KeyStoreType.Mnemonic, keys[0].mnemonic, keys[0].derivationPath);
    }

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
    export async function RestoreIdentityFromFundraiser(mnemonic: string, email: string, password: string, pkh: string): Promise<FileKeyStore> {
        return await FileKeyStoreUtils.RestoreIdentityFromMnemonic(mnemonic, email + password, pkh);
    }
}
import * as fs from "fs";
import * as bip39 from 'bip39';

import { KeyStore, KeyStoreCurve, KeyStoreType } from 'conseiljs';
import { Wallet, EncryptedWalletVersionOne } from 'conseiljs';
import { TezosMessageUtils } from 'conseiljs';

import { CryptoUtils } from './utils/CryptoUtils';

export class FileKeyStore implements KeyStore {
    publicKey: string;
    privateKey: string;
    publicKeyHash: string;
    curve: KeyStoreCurve;
    storeType: KeyStoreType;
    seed?: string;
    derivationPath?: string;

    constructor(publicKey: string, privateKey: string, publicKeyHash: string, curve: KeyStoreCurve = KeyStoreCurve.ED25519, storeType: KeyStoreType = KeyStoreType.Mnemonic, seed?: string, derivationPath?: string) {
        this.publicKey = publicKey;
        this.privateKey = privateKey;
        this.publicKeyHash = publicKeyHash;
        this.curve = curve;
        this.storeType = storeType;
        this.seed = seed;
        this.derivationPath = derivationPath;
    }

    public static GenerateIdentity(): FileKeyStore {
        bip39.generateMnemonic(strength)
        throw new Error();
    }

    public static RestoreIdentityFromSecretKey(privateKey: string, signer: Signer) : FileKeyStore {
        const secretKey = TezosMessageUtils.writeKeyWithHint(keyString, 'edsk');
        const keys = await CryptoUtils.recoverPublicKey(secretKey);

        const publicKey = TezosMessageUtils.readKeyWithHint(keys.publicKey, 'edpk');
        const publicKeyHash = TezosMessageUtils.computeKeyHash(keys.publicKey, 'tz1');

        return { publicKey, privateKey: keyString, publicKeyHash, seed: '', storeType: StoreType.Mnemonic }
    }

    public static RestoreIdentityFromMnemonic(mnemonic: string, password: string, derivationPath: string) : FileKeyStore {
        if (![12, 15, 18, 21, 24].includes(mnemonic.split(' ').length)) { throw new Error('Invalid mnemonic length.'); }
        if (!bip39.validateMnemonic(mnemonic)) { throw new Error('The given mnemonic could not be validated.'); }

        const seed = (await bip39.mnemonicToSeed(mnemonic, passphrase)).slice(0, 32);
        const keys = await CryptoUtils.generateKeys(seed);
        const privateKey = TezosMessageUtils.readKeyWithHint(keys.privateKey, 'edsk');
        const publicKey = TezosMessageUtils.readKeyWithHint(keys.publicKey, 'edpk');
        const publicKeyHash = TezosMessageUtils.computeKeyHash(keys.publicKey, 'tz1');

        if (!!pkh && publicKeyHash !== pkh) { throw new Error('The given mnemonic and passphrase do not correspond to the supplied public key hash'); }

        return { publicKey, privateKey, publicKeyHash, seed: '', storeType };
    }

    public static RestoreIdentityFromFile(path: string, password: string) : FileKeyStore {
        const p = new Promise<EncryptedWalletVersionOne>((resolve, reject) => {
            fs.readFile(filename, (err, data) => {
                if (err) { reject(err); return; }
                const encryptedWallet: EncryptedWalletVersionOne = JSON.parse(data.toString()) as EncryptedWalletVersionOne;
                resolve(encryptedWallet);
            });
        });

        const ew = await p;
        const encryptedKeys = TezosMessageUtils.writeBufferWithHint(ew.ciphertext);
        const salt = TezosMessageUtils.writeBufferWithHint(ew.salt);
        const keys = JSON.parse(await CryptoUtils.decryptMessage(encryptedKeys, passphrase, salt)) as KeyStore[];

        return { identities: keys };
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
    public static RestoreIdentityFromFundraiser() : FileKeyStore {
        return await getKeysFromMnemonicAndPassphrase(mnemonic, email + password, StoreType.Fundraiser, pkh);
    }

    public persistIdentity(path: string, password: string) {
        const keys = JSON.stringify(wallet.identities);
        const salt = await CryptoUtils.generateSaltForPwHash();
        const encryptedKeys = await CryptoUtils.encryptMessage(keys, passphrase, salt);

        const encryptedWallet: EncryptedWalletVersionOne = {
            version: '1',
            salt: TezosMessageUtils.readBufferWithHint(salt, ''),
            ciphertext: TezosMessageUtils.readBufferWithHint(encryptedKeys, ''),
            kdf: 'Argon2'
        };

        const p = new Promise((resolve, reject) => {
            fs.writeFile(filename, JSON.stringify(encryptedWallet), err => {
                if (err) { reject(err); return; }
                resolve();
            });
        });
        await p;
    }
}

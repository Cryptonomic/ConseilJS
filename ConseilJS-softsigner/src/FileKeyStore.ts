import * as fs from "fs";

import { KeyStore, KeyStoreCurve, KeyStoreType, Signer } from 'conseiljs';
import { Wallet, EncryptedWalletVersionOne } from 'conseiljs';
import { TezosMessageUtils } from 'conseiljs';

import { CryptoUtils } from './utils/CryptoUtils';

export class FileKeyStore implements KeyStore {
    publicKey: string;
    privateKey: string;
    publicKeyHash: string;
    curve: KeyStoreCurve;
    storeType: KeyStoreType;
    mnemonic?: string;
    derivationPath?: string;

    constructor(publicKey: string, privateKey: string, publicKeyHash: string, curve: KeyStoreCurve = KeyStoreCurve.ED25519, storeType: KeyStoreType = KeyStoreType.Mnemonic, mnemonic?: string, derivationPath?: string) {
        this.publicKey = publicKey;
        this.privateKey = privateKey;
        this.publicKeyHash = publicKeyHash;
        this.curve = curve;
        this.storeType = storeType;
        this.mnemonic = mnemonic;
        this.derivationPath = derivationPath;
    }

    public async persistIdentity(path: string, password: string) {
        const keys = Buffer.from(JSON.stringify(wallet.identities));
        const salt = await CryptoUtils.generateSaltForPwHash();
        const encryptedKeys = await CryptoUtils.encryptMessage(keys, password, salt);

        const encryptedWallet: EncryptedWalletVersionOne = {
            version: '1',
            salt: TezosMessageUtils.readBufferWithHint(salt, ''),
            ciphertext: TezosMessageUtils.readBufferWithHint(encryptedKeys, ''),
            kdf: 'Argon2'
        };

        const p = new Promise((resolve, reject) => {
            fs.writeFile(path, JSON.stringify(encryptedWallet), err => {
                if (err) { reject(err); return; }
                resolve();
            });
        });
        await p;
    }
}

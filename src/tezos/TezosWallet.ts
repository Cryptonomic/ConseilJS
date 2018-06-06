import {Wallet} from "../types/Wallet";
import * as fs from "fs";
import {KeyStore} from "../types/KeyStore";
import * as CryptoUtils from "../utils/CryptoUtils";

export function createWallet(filename: string, password: string): Promise<Wallet> {
    return new Promise<Wallet>((resolve, reject) => {
        if (fs.existsSync(filename)) reject("A wallet already exists at this path!")
        const wallet: Wallet = {
            identities: []
        }
        fs.writeFile(filename, JSON.stringify(wallet), (err) => {
            if (err) reject(err);
            resolve(wallet)
        });
    })
}

export function saveWallet(filename: string, wallet: Wallet): Promise<Wallet> {
    return new Promise<Wallet>((resolve, reject) => {
        fs.writeFile(filename, JSON.stringify(wallet), (err) => {
            if (err) reject(err);
            resolve(wallet)
        });
    })
}

export function loadWallet(filename: string, password: string): Promise<Wallet> {
    return new Promise<Wallet>((resolve, reject) => {
        fs.readFile(filename, (err, data) => {
            if (err) reject(err);
            const wallet = <Wallet> JSON.parse(data.toString())
            resolve(wallet)
        });
    })
}

export function unlockFundraiserIdentity(mnemonic: string, email: string, password: string): KeyStore {
    const passphrase = email + password
    return CryptoUtils.getKeysFromMnemonicAndPassphrase(mnemonic, passphrase)
}

export function generateMnemonic(): string {
    return CryptoUtils.generateMnemonic()
}

export function unlockIdentityWithMnemonic(mnemonic: string, passphrase: string): KeyStore {
    return CryptoUtils.getKeysFromMnemonicAndPassphrase(mnemonic, passphrase)
}
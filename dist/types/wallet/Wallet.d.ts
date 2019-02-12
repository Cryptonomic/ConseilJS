import { KeyStore } from "./KeyStore";
export interface Wallet {
    identities: KeyStore[];
}
export interface EncryptedWalletVersionOne {
    version: string;
    salt: string;
    ciphertext: string;
    kdf: string;
}

import { KeyStore } from "../ExternalInterfaces";

/**
 * Represents a generic cryptocurrency wallet.
 */
export interface Wallet {
    identities: KeyStore[]
}

/**
 * Represents the first version of an encrypted wallet.
 */
export interface EncryptedWalletVersionOne {
    version: string,
    salt: string,
    ciphertext: string,
    /**
     * Key derivation function
     */
    kdf: string
}
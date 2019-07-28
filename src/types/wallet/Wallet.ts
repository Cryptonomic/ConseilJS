import { KeyStore } from "./KeyStore";
import { AddressBookEntry } from "./AddressBookEntry";

/**
 * Represents a generic cryptocurrency wallet.
 */
export interface Wallet {
    identities: KeyStore[],
    knownAddresses: { [label: string]: AddressBookEntry }
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

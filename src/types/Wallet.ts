import {KeyStore} from "./KeyStore";

/**
 * Represents a generic cryptocurrency wallet.
 */
export interface Wallet {
    identities: KeyStore[]
}
/**
 * Represents a generic cryptocurrency key pair.
 */
export interface KeyStore {
    publicKey: string,
    privateKey: string,
    publicKeyHash: string
}
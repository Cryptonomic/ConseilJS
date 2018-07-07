/**
 * Represents a generic cryptocurrency key pair.
 * Seed and nonce are only populated in HD mode.
 */
export interface KeyStore {
    publicKey: string,
    privateKey: string,
    publicKeyHash: string,
    seed: string,
    nonce: string
}
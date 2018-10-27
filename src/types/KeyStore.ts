/**
 * Represents a generic cryptocurrency key store.
 * The seed is only used for HD wallets.
 */
export interface KeyStore {
    publicKey: string,
    privateKey: string,
    publicKeyHash: string,
    seed: string,
    storeType: StoreType
}

/**
 * Type of key store, i.e. whether it was generated from a fundraiser PDF or from a new mnemonic
 */
export enum StoreType {
    Mnemonic,
    Fundraiser,
    Hardware
}
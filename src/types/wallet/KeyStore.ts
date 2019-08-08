/**
 * Represents a generic cryptocurrency key store.
 * The seed is only used for HD wallets.
 */
export interface KeyStore {
    publicKey: string,
    privateKey: string,
    publicKeyHash: string,
    seed: string,
    derivationPath?: string,
    storeType: StoreType
}

export enum StoreType {
    Mnemonic,
    Fundraiser,
    Hardware
}

export interface KeyStore {
    publicKey: string;
    privateKey: string;
    publicKeyHash: string;
    seed: string;
    storeType: StoreType;
}
export declare enum StoreType {
    Mnemonic = 0,
    Fundraiser = 1,
    Hardware = 2
}

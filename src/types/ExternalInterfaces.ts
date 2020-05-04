export interface Signer {
    encryptMessage;
    decryptMessage;
    sign: (bytes: Buffer, keys: KeyStore) => Promise<Buffer>;
    checkSignature;
}

export interface KeyStore {
    publicKey: string;
    privateKey: string;
    publicKeyHash: string;
    curve: KeyStoreCurve;
    storeType: KeyStoreType;
    seed?: string;
    derivationPath?: string;
}

export enum KeyStoreType {
    Mnemonic,
    Fundraiser,
    Hardware
}

export enum KeyStoreCurve {
    ED25519,
    SECP256K1,
    SECP256R1
}

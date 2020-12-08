export enum SignerCurve {
    ED25519,
    SECP256K1,
    SECP256R1
}

export interface Signer {
    getSignerCurve: () => SignerCurve;
    signOperation: (bytes: Buffer, password?: string) => Promise<Buffer>;
    signText: (message: string, password?: string) => Promise<string>;
    signTextHash: (message: string, password?: string) => Promise<string>;
}

export interface KeyStore {
    publicKey: string;
    secretKey: string;
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

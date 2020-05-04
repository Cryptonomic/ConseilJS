export interface Signer {
    generateKeys: (seed: Buffer) => Promise<{ publicKey: Buffer, secretKey: Buffer}>;
    decryptMessage: (message: Buffer, passphrase: string, salt: Buffer) => Promise<Buffer>;
    encryptMessage: (message: Buffer, passphrase: string, salt: Buffer) => Promise<Buffer>;
    sign: (bytes: Buffer, secretKey: Buffer) => Promise<Buffer>;

    signText: (message: string, secretKey: string) => Promise<string>;
    checkTextSignature: (signature: string, message: string, publicKey: string) => Promise<boolean>;
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

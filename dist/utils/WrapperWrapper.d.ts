export declare namespace SodiumWrapper {
    const rand: (length: any) => Promise<any>;
    const salt: () => Promise<any>;
    const nonce: () => Promise<any>;
    const keys: (seed: any) => Promise<any>;
    const pwhash: (passphrase: any, salt: any) => Promise<any>;
    const close: (message: any, nonce: any, key: any) => Promise<any>;
    const open: (nonce_and_ciphertext: any, key: any) => Promise<any>;
    const sign: (message: any, key: any) => Promise<any>;
}

/// <reference types="node" />
export declare namespace CryptoUtils {
    function generateSaltForPwHash(): Promise<Buffer>;
    function encryptMessage(message: string, passphrase: string, salt: Buffer): Promise<Buffer>;
    function decryptMessage(nonce_and_ciphertext: Buffer, passphrase: string, salt: Buffer): Promise<string>;
    function simpleHash(payload: Buffer, length: number): Buffer;
    function getPasswordStrength(password: string): number;
    function generateKeys(seed: Buffer): Promise<{
        privateKey: any;
        publicKey: any;
    }>;
    function signDetached(payload: Buffer, secretKey: Buffer): Promise<Buffer>;
}

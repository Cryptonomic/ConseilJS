/// <reference types="node" />
export declare namespace CryptoUtils {
    function generateSaltForPwHash(): Buffer;
    function encryptMessage(message: string, passphrase: string, salt: Buffer): Buffer;
    function decryptMessage(nonce_and_ciphertext: Buffer, passphrase: string, salt: Buffer): string;
    function simpleHash(payload: Buffer, length: number): Buffer;
    function getPasswordStrength(password: string): number;
    function generateKeys(seed: string): {
        privateKey: Buffer;
        publicKey: Buffer;
    };
    function signDetached(payload: Buffer, secretKey: Buffer): Buffer;
}

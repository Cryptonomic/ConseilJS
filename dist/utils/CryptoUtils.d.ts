/// <reference types="node" />
export declare namespace CryptoUtils {
    function generateSaltForPwHash(): Buffer;
    function encryptMessage(message: string, passphrase: string, salt: Buffer): Buffer;
    function decryptMessage(nonce_and_ciphertext: Buffer, passphrase: string, salt: Buffer): any;
    function simpleHash(payload: Buffer, length: number): Buffer;
    function getPasswordStrength(password: string): number;
    function generateKeys(seed: string): {
        privateKey: any;
        publicKey: any;
    };
    function signDetached(payload: Buffer, privateKey: Buffer): Buffer;
}

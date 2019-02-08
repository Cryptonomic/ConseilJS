export declare namespace CryptoUtils {
    function generateSaltForPwHash(): Buffer;
    function encryptMessage(message: string, passphrase: string, salt: Buffer): Buffer;
    function decryptMessage(nonce_and_ciphertext: Buffer, passphrase: string, salt: Buffer): any;
    function simpleHash(payload: Buffer): Buffer;
    function getPasswordStrength(password: string): number;
}

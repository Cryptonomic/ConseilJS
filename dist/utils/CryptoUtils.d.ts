export declare function generateSaltForPwHash(): Buffer;
export declare function encryptMessage(message: string, passphrase: string, salt: Buffer): Buffer;
export declare function decryptMessage(nonce_and_ciphertext: Buffer, passphrase: string, salt: Buffer): any;
export declare function getPasswordStrength(password: string): number;

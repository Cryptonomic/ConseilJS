/// <reference types="node" />
import { KeyStore, StoreType } from "../types/KeyStore";
import { Error } from "../types/Error";
export declare function generateSaltForPwHash(): Buffer;
export declare function encryptMessage(message: string, passphrase: string, salt: Buffer): Buffer;
export declare function decryptMessage(nonce_and_ciphertext: Buffer, passphrase: string, salt: Buffer): any;
export declare function getBase58BytesForPrefix(prefix: string): Buffer;
export declare function base58CheckEncode(payload: Buffer, prefix: string): string;
export declare function base58CheckDecode(s: string, prefix: string): Buffer;
export declare function getKeysFromMnemonicAndPassphrase(mnemonic: string, passphrase: string, pkh: string | undefined, checkPKH: boolean | undefined, storeType: StoreType): Error | KeyStore;
export declare function generateMnemonic(): string;
export declare function getPasswordStrength(password: string): number;

import { Signer, TezosMessageUtils } from 'conseiljs';

import { CryptoUtils } from './utils/CryptoUtils'

/**
 *  libsodium/ed25519
 */
export class SoftSigner implements Signer {
    constructor() {

    }

    /**
     * 
     * @param seed 
     */
    public async generateKeys(seed: Buffer): Promise<{ publicKey: Buffer, secretKey: Buffer}> {
        const keys = await CryptoUtils.generateKeys(seed);
        return { publicKey: keys.publicKey, secretKey: keys.privateKey };
    }

    public async recoverKeys(secretKey: Buffer): Promise<{ publicKey: Buffer, secretKey: Buffer}> {
        const keys = await CryptoUtils.recoverPublicKey(secretKey);
        return { publicKey: keys.publicKey, secretKey: keys.privateKey };
    }

    /**
     * 
     * @param message 
     * @param passphrase 
     * @param salt 
     */
    public async decryptMessage(message: Buffer, passphrase: string, salt: Buffer): Promise<Buffer> {
        return CryptoUtils.decryptMessage(message, passphrase, salt);
    }

    /**
     * 
     * @param message 
     * @param passphrase 
     * @param salt 
     */
    public async encryptMessage(message: Buffer, passphrase: string, salt: Buffer): Promise<Buffer> {
        return CryptoUtils.encryptMessage(message, passphrase, salt);
    }

    /**
     * Signs a 
     * 
     * @param {Buffer} bytes Bytes to sign
     * @param {Buffer} secretKey Secret key
     * @returns {Buffer} Signature
     */
    public async sign(bytes: Buffer, secretKey: Buffer): Promise<Buffer> {
        return CryptoUtils.signDetached(bytes, secretKey);
    }

    /**
     * Convenience function that uses Tezos nomenclature to sign arbitrary text.
     * 
     * @param keyStore Key pair to use for signing
     * @param message UTF-8 test
     * @returns {Promise<string>} base58check-encoded signature prefixed with 'edsig'
     */
    public async signText(message: string, secretKey: string): Promise<string> {
        const privateKey = TezosMessageUtils.writeKeyWithHint(secretKey, 'edsk');
        const messageSig = await CryptoUtils.signDetached(Buffer.from(message, 'utf8'), privateKey);

        return TezosMessageUtils.readSignatureWithHint(messageSig, 'edsig');
    }

    /**
     * Convenience function that uses Tezos nomenclature to check signature of arbitrary text.
     * 
     * @param signature 
     * @param message 
     * @param publicKey 
     * * @returns {Promise<boolean>}
     */
    public async checkTextSignature(signature: string, message: string, publicKey: string): Promise<boolean> {
        const sig = TezosMessageUtils.writeSignatureWithHint(signature, 'edsig');
        const pk = TezosMessageUtils.writeKeyWithHint(publicKey, 'edpk');

        return await CryptoUtils.checkSignature(sig, Buffer.from(message, 'utf8'), pk);
    }
}

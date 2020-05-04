import { Signer } from 'conseiljs';

export class SoftSigner implements Signer {
    //encryptMessage;
    //decryptMessage;



    /**
     * Signs a forged operation
     * @param {Buffer} bytes 
     * @param {KeyStore} keyStore Key pair
     * @returns {Buffer} Signature
     */
    async function sign(bytes: Buffer, keyStore: KeyStore): Promise<Buffer> {
        const privateKeyBytes = TezosMessageUtils.writeKeyWithHint(keyStore.privateKey, 'edsk');

        return CryptoUtils.signDetached(bytes, privateKeyBytes);
    }

    /**
     * Signs arbitrary text using libsodium/ed25519.
     * 
     * @param keyStore Key pair to use for signing
     * @param message UTF-8 test
     * @returns {Promise<string>} base58check-encoded signature prefixed with 'edsig'
     */
    export async function signText(message: string, keyStore: KeyStore): Promise<string> {
        const privateKey = TezosMessageUtils.writeKeyWithHint(keyStore.privateKey, 'edsk');
        const messageSig = await CryptoUtils.signDetached(Buffer.from(message, 'utf8'), privateKey);
        return TezosMessageUtils.readSignatureWithHint(messageSig, 'edsig');
    }

    /**
     * 
     * @param signature 
     * @param message 
     * @param publicKey 
     * * @returns {Promise<boolean>}
     */
    export async function checkSignature(signature: string, message: string, publicKey): Promise<boolean> {
        const sig = TezosMessageUtils.writeSignatureWithHint(signature, 'edsig');
        const pk = TezosMessageUtils.writeKeyWithHint(publicKey, 'edpk');

        return await CryptoUtils.checkSignature(sig, Buffer.from(message, 'utf8'), pk);
    }
}
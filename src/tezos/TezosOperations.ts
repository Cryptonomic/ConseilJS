import sodium = require('libsodium-wrappers');
import * as CryptoUtils from '../utils/CryptoUtils';
import {KeyStore} from "../types/KeyPair";

export interface SignedOperationGroup {
    bytes: Buffer,
    signature: string
}

export function signOperationGroup(forgedOperation: string, keyStore: KeyStore): SignedOperationGroup {
    const watermark = '03'
    const watermarkedForgedOperationBytes: Buffer = sodium.from_hex(watermark + forgedOperation)
    const privateKeyBytes: Buffer = CryptoUtils.base58CheckDecode(keyStore.privateKey, "edsk")
    const hashedWatermarkedOpBytes: Buffer = sodium.crypto_generichash(32, watermarkedForgedOperationBytes)
    const opSignature: Buffer = sodium.crypto_sign_detached(hashedWatermarkedOpBytes, privateKeyBytes)
    const hexSignature: string = CryptoUtils.base58CheckEncode(opSignature, "edsig").toString()
    const signedOpBytes: Buffer = Buffer.concat([sodium.from_hex(forgedOperation), opSignature])
    return {
        bytes: signedOpBytes,
        signature: hexSignature.toString()
    }
}

export function computeOperationHash(signedOpGroup: SignedOperationGroup): string {
    const hash: Buffer = sodium.crypto_generichash(32, signedOpGroup.bytes)
    return CryptoUtils.base58CheckEncode(hash, "op").toString()
}


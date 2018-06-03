import sodium = require('libsodium-wrappers');
import base58check = require("bs58check");

export function signOperationGroup() {
    const privKey = 'edskRtLP6MGr3Y4taNfC19f4TjU3KYYHpfLQzxxovzX5aS4TztpbpajTVUzruNj53iLvymkwTKAnfE72dvPx7BPBan5tvdTrAg';
    const forgedOperation = '8f90f8f1f79bd69ae7d261252c51a1f5e8910f4fa2712a026f2acadb960416d900020000f10a450269188ebd9d29c6402d186bc381770fae000000000000c3500000001900000026010000000005f5e1000000bad6e61eb7b96f08783a476508e3d83b2bb15e19ff00000002030bb8010000000000000000';
    const watermark = '03'
    const watermarkedForgedOperationBytes = sodium.from_hex(watermark + forgedOperation)
    const privateKeyBytes = new Uint8Array(base58check.decode(privKey).slice(4))
    console.log(privateKeyBytes)
    const hashedWatermarkedOpBytes = sodium.crypto_generichash(32, watermarkedForgedOperationBytes)
    const hashedWatermarkedOpBytesInHex = sodium.to_hex(hashedWatermarkedOpBytes)
    console.log(hashedWatermarkedOpBytes)
    const opSignature = sodium.crypto_sign_detached(hashedWatermarkedOpBytes, privateKeyBytes)
    const opSignatureInHex = sodium.to_hex(opSignature)
    console.log("****" + hashedWatermarkedOpBytesInHex)
    return opSignatureInHex
}

export default signOperationGroup;
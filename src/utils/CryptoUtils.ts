import * as base58Check from 'bs58check'
import * as bip39 from 'bip39';
import * as sodium  from 'libsodium-wrappers';

export function getBase58BytesForPrefix(prefix: String): Buffer {
    switch(prefix)
    {
        case "tz1":
            return new Buffer([6, 161, 159])
        case "edpk":
            return new Buffer([13, 15, 37, 217])
        case "edsk":
            return new Buffer([43, 246, 78, 7]);
        case "edsig":
            return new Buffer([9, 245, 205, 134, 18]);
        case "op":
            return new Buffer([5, 116]);
        default:
            throw new RangeError("Unknown prefix");
    }
}

export function base58CheckEncode(payload: Buffer, prefix: String): String {
    const prefixBytes = getBase58BytesForPrefix(prefix)
    const prefixedPayload = Buffer.concat([prefixBytes, payload])
    return base58Check.encode(prefixedPayload)
}

export function base58CheckDecode(s: String, prefix: String): Buffer {
    const prefixBytes = getBase58BytesForPrefix(prefix)
    const charsToSlice = prefixBytes.length
    const decoded = base58Check.decode(s)
    return decoded.slice(charsToSlice)
}

export function getKeysFromMnemonicAndPassphrase(mnemonic: string, passphrase: string) {
    const seed = bip39.mnemonicToSeed(mnemonic, passphrase).slice(0, 32);
    const key_pair = sodium.crypto_sign_seed_keypair(seed);
    const privateKey = base58CheckEncode(key_pair.privateKey, "edsk")
    const publicKey = base58CheckEncode(key_pair.publicKey, "edpk")
    const publicKeyHash = base58CheckEncode(sodium.crypto_generichash(20, key_pair.publicKey), "tz1")
    return {
        publicKey: publicKey.toString(),
        privateKey: privateKey.toString(),
        publicKeyHash: publicKeyHash.toString()
    }
}

export function generateMnemonic(): string {
    return bip39.generateMnemonic(160)
}
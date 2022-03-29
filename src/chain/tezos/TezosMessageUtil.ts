/*eslint no-bitwise: 0*/
import base58check from "bs58check";
import bigInt from 'big-integer';
import * as blakejs from 'blakejs';

import { SignedOperationGroup } from '../../types/tezos/TezosChainTypes';
import { TezosLanguageUtil } from './TezosLanguageUtil';
import { TezosParameterFormat } from '../../types/tezos/TezosChainTypes';
import { SignerCurve } from "../../types/ExternalInterfaces";

/**
 * A collection of functions to encode and decode various Tezos P2P message components like amounts, addresses, hashes, etc.
 * 
 * Magic prefixes taken from: https://gitlab.com/tezos/tezos/blob/master/src/lib_crypto/base58.ml#L343
 */
export namespace TezosMessageUtils {
    /**
     * Encodes a boolean as 0 or 255 by calling writeInt.
     * @param {boolean} value 
     */
    export function writeBoolean(value: boolean): string {
        return value ? "ff" : "00";
    }

    /**
     * Takes a bounded hex string that is known to contain a boolean and decodes it as int.
     * @param {string} hex Encoded message part.
     */
    export function readBoolean(hex: string): boolean {
        return parseInt(hex, 16) > 0 ? true : false;
    }

    /**
     * Encodes an uint into hex after converting it to Zarith format.
     * @param {number} value Number to be obfuscated.
     */
    export function writeInt(value: number): string {
        if (value < 0) { throw new Error('Use writeSignedInt to encode negative numbers'); }
        //@ts-ignore
        return Buffer.from(Buffer.from(twoByteHex(value), 'hex').map((v, i) => { return i === 0 ? v : v ^ 0x80; }).reverse()).toString('hex');
    }

    /**
     * Encodes a signed integer into hex.
     * @param {number} value Number to be obfuscated.
     */
    export function writeSignedInt(value: number | string): string {
        if (value === 0 || value === '0') { return '00'; }

        let n = bigInt(value as string).abs();
        const l = n.bitLength().toJSNumber();
        let arr: number[] = [];

        for (let i = 0; i < l; i += 7) {
            let byte = bigInt.zero;

            if (i === 0) {
                byte = n.and(0x3f); // first byte makes room for sign flag
                n = n.shiftRight(6);
            } else {
                byte = n.and(0x7f); // NOT base128 encoded
                n = n.shiftRight(7);
            }

            if (value < 0 && i === 0) { byte = byte.or(0x40); } // set sign flag

            if (i + 7 < l) { byte = byte.or(0x80); } // set next byte flag

            arr.push(byte.toJSNumber());
        }

        if (l % 7 === 0) {
            arr[arr.length - 1] = arr[arr.length - 1] | 0x80;
            arr.push(1);
        }

        return arr.map(w => ('0' + w.toString(16)).slice(-2)).join('');
    }

    /**
     * Takes a bounded hex string that is known to contain a number in Zarith format and decodes the uint.
     * @param {string} hex Encoded message part.
     */
    export function readInt(hex: string): number {
        //@ts-ignore
        const h = Buffer.from(Buffer.from(hex, 'hex').reverse().map((v, i) => { return i === 0 ? v : v & 0x7f; })).toString('hex')
        return fromByteHex(h);
    }

    export function readSignedInt(hex: string): number {
        const positive = (Buffer.from(hex.slice(0, 2), 'hex')[0] & 0x40) ? false : true;
        //@ts-ignore
        const arr = Buffer.from(hex, 'hex').map((v, i) => i === 0 ? v & 0x3f : v & 0x7f);
        let n = bigInt.zero;
        for (let i = arr.length - 1; i >= 0; i--) {
            if (i === 0) {
                n = n.or(arr[i]);
            } else {
                n = n.or(bigInt(arr[i]).shiftLeft(7 * i - 1));
            }
        }

        return positive ? n.toJSNumber() : n.negate().toJSNumber();
    }

    /**
     * Takes a hex string and reads a hex-encoded Zarith-formatted number starting at provided offset. Returns the number itself and the number of characters that were used to decode it.
     * @param {string} hex Encoded message.
     * @param {number} offset Offset within the message to start decoding from.
     */
    export function findInt(hex: string, offset: number, signed: boolean = false) {
        let buffer = '';
        let i = 0;
        while (offset + i * 2 < hex.length) {
            let start = offset + i * 2;
            let end = start + 2;
            let part = hex.substring(start, end);
            buffer += part;
            i += 1;

            if (parseInt(part, 16) < 128) { break; }
        }

        return signed ? { value: readSignedInt(buffer), length: i * 2 } : { value: readInt(buffer), length: i * 2 };
    }

    export function writeString(value: string): string {
        const len = dataLength(value.length);
        const text = value.split('').map(c => c.charCodeAt(0).toString(16)).join('');

        return len + text;
    }

    export function readString(hex: string): string {
        const stringLen = parseInt(hex.substring(0, 8), 16);
        if (stringLen === 0) { return ''; }

        const stringHex = hex.slice(8);

        let text = '';
        for (let i = 0; i < stringHex.length; i += 2) {
            text += String.fromCharCode(parseInt(stringHex.substring(i, i + 2), 16));
        }

        return text;
    }

    /**
     * Takes a bounded hex string that is known to contain a Tezos address and decodes it. Supports implicit tz1, tz2, tz3 accounts and originated kt1.
     * An address is a public key hash of the account.
     * 
     * @param {string} hex Encoded message part.
     */
    export function readAddress(hex: string): string {
        if (hex.length !== 44 && hex.length !== 42) { throw new Error("Incorrect hex length to parse an address"); }

        let implicitHint = hex.length === 44 ? hex.substring(0, 4) : "00" + hex.substring(0, 2);
        let implicitPrefixLength = hex.length === 44 ? 4 : 2;

        if (implicitHint === "0000") { // tz1
            return base58check.encode(Buffer.from("06a19f" + hex.substring(implicitPrefixLength), "hex"));
        } else if (implicitHint === "0001") { // tz2
            return base58check.encode(Buffer.from("06a1a1" + hex.substring(implicitPrefixLength), "hex"));
        } else if (implicitHint === "0002") { // tz3
            return base58check.encode(Buffer.from("06a1a4" + hex.substring(implicitPrefixLength), "hex"));
        } else if (hex.substring(0, 2) === "01" && hex.length === 44) { // kt1
            return base58check.encode(Buffer.from("025a79" + hex.substring(2, 42), "hex"));
        } else {
            throw new Error("Unrecognized address type");
        }
    }

    /**
     * Reads an address value from binary and decodes it into a Base58-check address without a prefix.
     * 
     * This is data type is referred to as `$contract_id` in the official documentation.
     * 
     * @param {Buffer | Uint8Array} b Bytes containing address.
     * @param hint One of: 'kt1', 'tz1', 'tz2', 'tz3'.
     */
    export function readAddressWithHint(b: Buffer | Uint8Array, hint: string): string {
        const address = !(b instanceof Buffer) ? Buffer.from(b) : b;

        if (hint === 'tz1') {
            return readAddress(`0000${address.toString('hex')}`);
        } else if (hint === 'tz2') {
            return readAddress(`0001${address.toString('hex')}`);
        } else if (hint === 'tz3') {
            return readAddress(`0002${address.toString('hex')}`);
        } else if (hint === 'kt1') {
            return readAddress(`01${address.toString('hex')}00`);
        } else {
            throw new Error(`Unrecognized address hint, '${hint}'`);
        }
    }

    /**
     * Encodes a Tezos address to hex, stripping off the top 3 bytes which contain address type, either 'tz1', 'tz2', 'tz3' or 'kt1'. Message format contains hints on address type.
     * 
     * This is data type is referred to as `$contract_id` in the official documentation. Cutting off the first byte (2-chars) makes this string compatible with `$public_key_hash` as well.
     * 
     * @param {string} address Base58-check address to encode.
     * @returns {string} Hex representation of a Tezos address.
     */
    export function writeAddress(address: string): string {
        const hex = base58check.decode(address).slice(3).toString("hex");
        if (address.startsWith("tz1")) {
            return "0000" + hex;
        } else if (address.startsWith("tz2")) {
            return "0001" + hex;
        } else if (address.startsWith("tz3")) {
            return "0002" + hex;
        } else if (address.startsWith("KT1")) {
            return "01" + hex + "00";
        } else {
            throw new Error(`Unrecognized address prefix: ${address.substring(0, 3)}`);
        }
    }

    /**
     * Reads the branch hash from the provided, bounded hex string.
     * @param {string} hex Encoded message part.
     */
    export function readBranch(hex: string): string {
        if (hex.length !== 64) { throw new Error('Incorrect hex length to parse a branch hash'); }
        return base58check.encode(Buffer.from('0134' + hex, 'hex'));
    }

    /**
     * Encodes the branch hash to hex.
     * 
     * @param {string} branch Branch hash.
     * @returns {string} Hex representation of the Base58-check branch hash.
     */
    export function writeBranch(branch: string): string {
        return base58check.decode(branch).slice(2).toString("hex");
    }

    /**
     * Reads the public key from the provided, bounded hex string into a Base58-check string.
     * 
     * @param {string} hex Encoded message part.
     * @returns {string} Key.
     */
    export function readPublicKey(hex: string): string {
        if (hex.length !== 66 && hex.length !== 68) { throw new Error(`Incorrect hex length, ${hex.length} to parse a key`); }

        let hint = hex.substring(0, 2);
        if (hint === "00") { // ed25519
            return base58check.encode(Buffer.from("0d0f25d9" + hex.substring(2), "hex"));
        } else if (hint === "01" && hex.length === 68) { // secp256k1
            return base58check.encode(Buffer.from("03fee256" + hex.substring(2), "hex"));
        } else if (hint === "02" && hex.length === 68) { // secp256r1
            return base58check.encode(Buffer.from("03b28b7f" + hex.substring(2), "hex"));
        } else {
            throw new Error('Unrecognized key type');
        }
    }

    /**
     * Encodes a public key in Base58-check into a hex string.
     */
    export function writePublicKey(publicKey: string): string {
        if (publicKey.startsWith("edpk")) { // ed25519
            return "00" + base58check.decode(publicKey).slice(4).toString("hex");
        } else if (publicKey.startsWith("sppk")) { // secp256k1
            return "01" + base58check.decode(publicKey).slice(4).toString("hex");
        } else if (publicKey.startsWith("p2pk")) { // secp256r1 (p256)
            return "02" + base58check.decode(publicKey).slice(4).toString("hex");
        } else {
            throw new Error('Unrecognized key type');
        }
    }

    /**
     * Deserialize a key without a prefix from binary and decodes it into a Base58-check representation.
     * 
     * @param {Buffer | Uint8Array} b Bytes containing the key.
     * @param hint 
     */
    export function readKeyWithHint(b: Buffer | Uint8Array, hint: string): string {
        const key = !(b instanceof Buffer) ? Buffer.from(b) : b;

        if (hint === 'edsk') { // ed25519 secret key
            return base58check.encode(Buffer.from('2bf64e07' + key.toString('hex'), 'hex'));
        } else if (hint === 'edpk') { // ed25519 public key
            return readPublicKey(`00${key.toString('hex')}`);
        } else if (hint === 'sppk') {// secp256k1 public key
            return readPublicKey(`01${key.toString('hex')}`);
        } else if (hint === 'p2pk') {// secp256r1 public key
            return readPublicKey(`02${key.toString('hex')}`);
        } else {
            throw new Error(`Unrecognized key hint, '${hint}'`);
        }
    }

    /**
     * Serializes a Base58-check key into hex.
     * 
     * @param key Key to encode, input is expected to be a base58-check encoded string.
     * @param hint Key type, usually the curve it was generated from, eg: 'edsk'.
     */
    export function writeKeyWithHint(key: string, hint: string): Buffer {
        if (hint === 'edsk' || hint === 'edpk' || hint === 'sppk' || hint === 'p2pk') {
            return base58check.decode(key).slice(4);
        } else {
            throw new Error(`Unrecognized key hint, '${hint}'`);
        }
    }

    /**
     * Deserializes a signature value without a prefix from binary and decodes it into a Base58-check representation.
     * 
     * @param {Buffer | Uint8Array} b Bytes containing signature.
     * @param hint Support 'edsig'.
     */
    export function readSignatureWithHint(b: Buffer | Uint8Array, hint: string | SignerCurve): string {
        const sig = !(b instanceof Buffer) ? Buffer.from(b) : b;

        if (hint === 'edsig' || hint === SignerCurve.ED25519) {
            return base58check.encode(Buffer.from('09f5cd8612' + sig.toString('hex'), 'hex'));
        } else if (hint === 'spsig' || hint === SignerCurve.SECP256K1) {
            return base58check.encode(Buffer.from('0d7365133f' + sig.toString('hex'), 'hex'));
        } else if (hint === 'p2sig' || hint === SignerCurve.SECP256R1) {
            return base58check.encode(Buffer.from('36f02c34' + sig.toString('hex'), 'hex'));
        } else {
            throw new Error(`Unrecognized signature hint, '${hint}'`);
        }
    }

    /**
     * Serializes a Base58-check key into hex.
     * 
     * @param key Key to encode, input is expected to be a base58-check encoded string.
     * @param hint Key type, usually the curve it was generated from, eg: 'edsig'.
     */
    export function writeSignatureWithHint(sig: string, hint: string | SignerCurve): Buffer {
        if (hint === 'edsig' || hint === SignerCurve.ED25519) {
            return base58check.decode(sig).slice("edsig".length);
        } else if (hint === 'spsig' || hint === SignerCurve.SECP256K1) {
            return base58check.decode(sig).slice("spsig".length);
        } else if (hint === 'p2sig' || hint === SignerCurve.SECP256R1) {
            return base58check.decode(sig).slice("p2sig".length);
        } else {
            throw new Error(`Unrecognized key hint, '${hint}'`);
        }
    }

    /**
     * Deserializes a binary buffer and decodes it into a Base58-check string subject to a hint. Calling this method with a blank hint makes it a wrapper for base58check.encode().
     * 
     * @param {Buffer | Uint8Array} b Bytes to encode
     * @param hint One of: 'op' (operation encoding helper), 'p' (proposal), expr (expression), '' (blank)
     */
    export function readBufferWithHint(b: Buffer | Uint8Array, hint: string = ''): string {
        const buffer = !(b instanceof Buffer) ? Buffer.from(b) : b;

        if (hint === 'op') {
            return base58check.encode(Buffer.from('0574' + buffer.toString('hex'), 'hex'));
        } else if (hint === 'p') {
            return base58check.encode(Buffer.from('02aa' + buffer.toString('hex'), 'hex'));
        } else if (hint === 'expr') {
            return base58check.encode(Buffer.from('0d2c401b' + buffer.toString('hex'), 'hex'));
        } else if (hint === 'chain_id') {
            return base58check.encode(Buffer.from('575200' + buffer.toString('hex'), 'hex'));
        } else if (hint === '') {
            return base58check.encode(buffer);
        } else {
            throw new Error(`Unsupported hint, '${hint}'`);
        }
    }

    /**
     * Writes an arbitrary Base58-check string into hex.
     * 
     * @param b String to convert.
     * @param hint Hint to use while encoding, blank will encode the string directly, 'chain_id' will encode a chainid type.
     */
     export function writeBufferWithHint(b: string, hint: string = ''): Buffer {
        if (hint === '') {
            return base58check.decode(b);
        }

        if (hint === 'chain_id') {
            return base58check.decode(b).slice("Net".length);
        }

        throw new Error(`Unsupported hint, '${hint}'`);
    }

    /**
     * Computes a hash of an operation group then encodes it with Base58-check. This value becomes the operation group id.
     * 
     * @param {SignedOperationGroup} signedOpGroup Signed operation group
     * @returns {string} Base58Check hash of signed operation
     */
    export function computeOperationHash(signedOpGroup: SignedOperationGroup): string {
        const hash = simpleHash(signedOpGroup.bytes, 32);
        return readBufferWithHint(hash, "op");
    }

    /**
     * Consumes a Base58-check key and produces a 20 byte key hash, often referred to as address.
     * 
     * @param key Base58-check encoded key
     * @param prefix A key hint, eg: 'tz1', 'tz2', etc.
     * @returns Base58-check encoded key hash.
     */
    export function computeKeyHash(key: Buffer, prefix: string = 'tz1'): string {
        const hash = simpleHash(key, 20);
        return readAddressWithHint(hash, prefix);
    }

    function dataLength(value: number) {
        return ('0000000' + (value).toString(16)).slice(-8);
    }

    /**
     * Creates a binary representation of the provided value. This is the equivalent of the PACK instruction in Michelson.
     * 
     * @param value string, number or bytes to encode. A string value can also be code.
     * @param type Type of data to encode, supports various Michelson primitives like int, nat, string, key_hash, address and bytes. This argument should be left blank if encoding a complex value, see format.
     * @param format value format, this argument is used to encode complex values, Michelson and Micheline encoding is supported with the internal parser.
     */
    export function writePackedData(value: string | number | Buffer, type: string, format: TezosParameterFormat = TezosParameterFormat.Micheline): string {
        switch (type) {
            case 'int': {
                return '0500' + writeSignedInt(value as number);
            }
            case 'nat': {
                return '0500' + writeInt(value as number);
            }
            case 'string': {
                return '0501' + writeString(value as string);
            }
            case 'key_hash': {
                const address = writeAddress(value as string).slice(2);
                return `050a${dataLength(address.length / 2)}${address}`;
            }
            case 'address': {
                const address = writeAddress(value as string);
                return `050a${dataLength(address.length / 2)}${address}`;
            }
            case 'bytes': {
                const buffer = (value as Buffer).toString('hex');
                return `050a${dataLength(buffer.length / 2)}${buffer}`;
            }
            default: {
                try {
                    if (format === TezosParameterFormat.Micheline) {
                        return `05${TezosLanguageUtil.translateMichelineToHex(value as string)}`;
                    } else if (format === TezosParameterFormat.Michelson) {
                        const micheline = TezosLanguageUtil.translateMichelsonToMicheline(value as string);
                        return `05${TezosLanguageUtil.translateMichelineToHex(micheline)}`;
                    } else {
                        throw new Error(`Unsupported format, ${format}, provided`);
                    }
                } catch (e) {
                    throw new Error(`Unrecognized data type or format: '${type}', '${format}': ${e}`);
                }
            }
        }
    }

    /**
     * Reads PACKed data into an output format specified in the type parameter.
     * 
     * @param {string} hex 
     * @param {string} type One of int, nat, string, key_hash, address, bytes, michelson, micheline (default)
     */
    export function readPackedData(hex: string, type: string): string | number {
        switch (type) {
            case 'int': {
                return readSignedInt(hex.slice(4));
            }
            case 'nat': {
                return readInt(hex.slice(4));
            }
            case 'string': {
                return readString(hex.slice(4));
            }
            case 'key_hash': {
                return readAddress(`00${hex.slice(4 + 8)}`);
            }
            case 'address': {
                return readAddress(hex.slice(4 + 8));
            }
            case 'bytes': {
                return hex.slice(4 + 8);
            }
            case 'michelson': {
                return TezosLanguageUtil.normalizeMichelsonWhiteSpace(TezosLanguageUtil.hexToMichelson(hex.slice(2)).code);
            }
            default: {
                return TezosLanguageUtil.hexToMicheline(hex.slice(2)).code;
            }
        }
    }

    /**
     * Created a hash of the provided buffer that can then be used to query a big_map structure on chain.
     */
    export function encodeBigMapKey(key: Buffer): string {
        return readBufferWithHint(simpleHash(key, 32), 'expr');
    }

    /**
     * Computes a BLAKE2b message hash of the requested length.
     * 
     * @param {Buffer} payload Buffer to hash
     * @param {number} length Length of hash to produce
     */
    export function simpleHash(payload: Buffer, length: number): Buffer {
        return Buffer.from(blakejs.blake2b(payload, null, length)); // Same as libsodium.crypto_generichash
    }

    /**
     * Encodes the provided number as base128.
     * @param n 
     */
    function twoByteHex(n: number): string {
        if (n < 128) { return ('0' + n.toString(16)).slice(-2); }

        let h = '';
        if (n > 2147483648) {
            let r = bigInt(n);
            while (r.greater(0)) {
                h = ('0' + (r.and(127)).toString(16)).slice(-2) + h;
                r = r.shiftRight(7);
            }
        } else {
            let r = n;
            while (r > 0) {
                h = ('0' + (r & 127).toString(16)).slice(-2) + h;
                r = r >> 7;
            }
        }

        return h;
    }

    /**
     * Decodes the provided base128 string into a number
     * @param s 
     */
    function fromByteHex(s: string): number {
        if (s.length === 2) { return parseInt(s, 16); }

        if (s.length <= 8) {
            let n = parseInt(s.slice(-2), 16);

            for (let i = 1; i < s.length / 2; i++) {
                n += parseInt(s.slice(-2 * i - 2, -2 * i), 16) << (7 * i);
            }

            return n;
        }

        let n = bigInt(parseInt(s.slice(-2), 16));

        for (let i = 1; i < s.length / 2; i++) {
            n = n.add(bigInt(parseInt(s.slice(-2 * i - 2, -2 * i), 16)).shiftLeft(7 * i));
        }

        return n.toJSNumber();
    }

    /**
     * Calculate the address of a contract that was originated.
     *
     * @param operationHash The operation group hash.
     * @param index The index of the origination operation in the operation group.
     */
    export function calculateContractAddress(operationHash: string, index: number): string {
        // Decode and slice two byte prefix off operation hash.
        const decoded: Uint8Array = base58check.decode(operationHash).slice(2)

        // Merge the decoded buffer with the operation prefix.
        let decodedAndOperationPrefix: Array<number> = []
        for (let i = 0; i < decoded.length; i++) {
            decodedAndOperationPrefix.push(decoded[i])
        }
        decodedAndOperationPrefix = decodedAndOperationPrefix.concat([
            (index & 0xff000000) >> 24,
            (index & 0x00ff0000) >> 16,
            (index & 0x0000ff00) >> 8,
            index & 0x000000ff,
        ])

        // Hash and encode.
        const hash = blakejs.blake2b(new Uint8Array(decodedAndOperationPrefix), null, 20)
        const smartContractAddressPrefix = new Uint8Array([2, 90, 121]) // KT1
        const prefixedBytes = mergeBytes(smartContractAddressPrefix, hash)
        return base58check.encode(prefixedBytes)
    }

    /**
     * Helper to merge two Uint8Arrays.
     * 
     * @param a The first array.
     * @param b The second array.
     * @returns A new array that contains b appended to the end of a.
     */
    function mergeBytes(a: Uint8Array, b: Uint8Array): Uint8Array {
        const merged = new Uint8Array(a.length + b.length)
        merged.set(a)
        merged.set(b, a.length)

        return merged
    }
}

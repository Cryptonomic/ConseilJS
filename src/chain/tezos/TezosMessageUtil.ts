/*eslint no-bitwise: 0*/
import base58check from "bs58check";
import baseN from "base-n";

import * as Micheline from './lexer/Micheline';
import * as Michelson from './lexer/Michelson';
import * as nearley from 'nearley';

import {SignedOperationGroup} from '../../types/tezos/TezosChainTypes';
import {CryptoUtils} from '../../utils/CryptoUtils';

const base128 = baseN.create({
  characters: [...Array(128).keys()].map(k => ("0" + k.toString(16)).slice(-2))
});

// TODO: share this with the parser somehow
const MichelineKeywords = ['"parameter"', '"storage"', '"code"', '"False"', '"Elt"', '"Left"', '"None"', '"Pair"', '"Right"', '"Some"', '"True"', '"Unit"', '"PACK"', '"UNPACK"', '"BLAKE2B"', '"SHA256"', '"SHA512"', '"ABS"', '"ADD"', '"AMOUNT"', '"AND"', '"BALANCE"', '"CAR"', '"CDR"', '"CHECK_SIGNATURE"', '"COMPARE"', '"CONCAT"', '"CONS"', '"CREATE_ACCOUNT"', '"CREATE_CONTRACT"', '"IMPLICIT_ACCOUNT"', '"DIP"', '"DROP"', '"DUP"', '"EDIV"', '"EMPTY_MAP"', '"EMPTY_SET"', '"EQ"', '"EXEC"', '"FAILWITH"', '"GE"', '"GET"', '"GT"', '"HASH_KEY"', '"IF"', '"IF_CONS"', '"IF_LEFT"', '"IF_NONE"', '"INT"', '"LAMBDA"', '"LE"', '"LEFT"', '"LOOP"', '"LSL"', '"LSR"', '"LT"', '"MAP"', '"MEM"', '"MUL"', '"NEG"', '"NEQ"', '"NIL"', '"NONE"', '"NOT"', '"NOW"', '"OR"', '"PAIR"', '"PUSH"', '"RIGHT"', '"SIZE"', '"SOME"', '"SOURCE"', '"SENDER"', '"SELF"', '"STEPS_TO_QUOTA"', '"SUB"', '"SWAP"', '"TRANSFER_TOKENS"', '"SET_DELEGATE"', '"UNIT"', '"UPDATE"', '"XOR"', '"ITER"', '"LOOP_LEFT"', '"ADDRESS"', '"CONTRACT"', '"ISNAT"', '"CAST"', '"RENAME"', '"bool"', '"contract"', '"int"', '"key"', '"key_hash"', '"lambda"', '"list"', '"map"', '"big_map"', '"nat"', '"option"', '"or"', '"pair"', '"set"', '"signature"', '"string"', '"bytes"', '"mutez"', '"timestamp"', '"unit"', '"operation"', '"address"', '"SLICE"', '"DEFAULT_ACCOUNT"', '"tez"'];

/**
 * A collection of functions to encode and decode various Tezos P2P message components like amounts, addresses, hashes, etc.
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
   * Encodes an integer into hex after converting it to Zarith format.
   * @param {number} value Number to be obfuscated.
   */
  export function writeInt(value: number): string {
    //@ts-ignore
    return Buffer.from(base128.encode(parseInt(value, 10)), "hex")
      .map((v, i) => {
        return i === 0 ? v : v ^ 0x80;
      })
      .reverse()
      .toString("hex");
  }

  /**
   * Takes a bounded hex string that is known to contain a number and decodes the int.
   * @param {string} hex Encoded message part.
   */
  export function readInt(hex: string): number {
    return base128.decode(
      //@ts-ignore
      Buffer.from(hex, "hex")
        .reverse()
        .map((v, i) => {
          return i === 0 ? v : v & 0x7f;
        })
        .toString("hex")
    );
  }

  /**
   * Takes a hex string and reads a hex-encoded Zarith-formatted number starting at provided offset. Returns the number itself and the number of characters that were used to decode it.
   * @param {string} hex Encoded message.
   * @param {number} offset Offset within the message to start decoding from.
   */
  export function findInt(hex: string, offset: number) {
    let buffer = "";
    let i = 0;
    while (offset + i * 2 < hex.length) {
      let start = offset + i * 2;
      let end = start + 2;
      let part = hex.substring(start, end);
      buffer += part;
      i += 1;

      if (parseInt(part, 16) < 127) {
        break;
      }
    }

    return { value: readInt(buffer), length: i * 2 };
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
      throw new Error("Unrecognized address type");
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
   * @returns {string} Hex represntaton of the Base58-check branch hash.
   */
  export function writeBranch(branch: string): string {
    return base58check.decode(branch).toString("hex").slice(4);
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
    } else if (hint === "02" && hex.length === 68) { // p256
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
    } else if (publicKey.startsWith("p2pk")) { // p256
      return "02" + base58check.decode(publicKey).slice(4).toString("hex");
    } else {
      throw new Error('Unrecognized key type');
    }
  }

  /**
   * Reads a key without a prefix from binary and decodes it into a Base58-check representation.
   * 
   * @param {Buffer | Uint8Array} b Bytes containing the key.
   * @param hint One of 'edsk' (private key), 'edpk' (public key).
   */
  export function readKeyWithHint(b: Buffer | Uint8Array, hint: string): string {
    const key = !(b instanceof Buffer) ? Buffer.from(b) : b;

    if (hint === 'edsk') {
      return base58check.encode(Buffer.from('2bf64e07' + key.toString('hex'), 'hex'));
    } else if (hint === 'edpk') {
      return readPublicKey(`00${key.toString('hex')}`);
    } else {
      throw new Error(`Unrecognized key hint, '${hint}'`);
    }
  }

  /**
   * Writes a Base58-check key into hex.
   * 
   * @param key Key to encode.
   * @param hint Key type, usually the curve it was generated from, eg: 'edsk'.
   */
  export function writeKeyWithHint(key: string, hint: string): Buffer {
    if (hint === 'edsk' || hint === 'edpk') {
      return base58check.decode(key).slice(4);
    } else {
      throw new Error(`Unrecognized key hint, '${hint}'`);
    }
  }

  /**
   * Reads a signature value without a prefix from binary and decodes it into a Base58-check representation.
   * 
   * @param {Buffer | Uint8Array} b Bytes containing signature.
   * @param hint Support 'edsig'.
   */
  export function readSignatureWithHint(b: Buffer | Uint8Array, hint: string): string {
    const sig = !(b instanceof Buffer) ? Buffer.from(b) : b;

    if (hint === 'edsig') {
      return base58check.encode(Buffer.from('09f5cd8612' + sig.toString('hex'), 'hex'));
    } else {
      throw new Error(`Unrecognized signature hint, '${hint}'`);
    }
  }

  /**
   * Reads a binary buffer and decodes it into a Base58-check string subject to a hint. Calling this method with a blank hint makes it a wraper for base58check.encode().
   * 
   * @param {Buffer | Uint8Array} b Bytes to encode
   * @param hint One of: 'op' (operation encoding helper), 'p' (proposal), '' (blank)
   */
  export function readBufferWithHint(b: Buffer | Uint8Array, hint: string): string {
    const buffer = !(b instanceof Buffer) ? Buffer.from(b) : b;

    if (hint === 'op') {
      return base58check.encode(Buffer.from('0574' + buffer.toString('hex'), 'hex'));
    } else if (hint === 'p') {
      return base58check.encode(Buffer.from('02aa' + buffer.toString('hex'), 'hex'));
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
   */
  export function writeBufferWithHint(b: string): Buffer {
    return base58check.decode(b);
  }

    /**
     * Computes a hash of an operation group then encodes it with Base58-check. This value becomes the operation group id.
     * 
     * @param {SignedOperationGroup} signedOpGroup Signed operation group
     * @returns {string} Base58Check hash of signed operation
     */
    export function computeOperationHash(signedOpGroup: SignedOperationGroup): string {
      const hash = CryptoUtils.simpleHash(signedOpGroup.bytes, 32);
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
      const hash = CryptoUtils.simpleHash(key, 20);
      return readAddressWithHint(hash, prefix);
    }

    export function hexToMicheline(hex: string): codeEnvelope {
      let code = '';
      let offset = 0;
      let fieldType = hex.substring(offset, offset + 2);
      offset += 2;

      switch(fieldType) {
        case '00': {
          const value = findInt(hex.substring(offset), 0);
          code += `{ "int": "${value.value}" }`;
          offset += value.length;
          break;
        }
        case '01': {
          const stringEnvelope = michelineHexToString(hex.substring(offset));
          code += `{ "string": "${stringEnvelope.code}" }`;
          offset += stringEnvelope.consumed;
          break;
        }
        case '02': {
          const length = parseInt(hex.substring(offset, offset + 8), 16);
          offset += 8;
          let buffer: string[] = [];
          let consumed = 0;
          while (consumed < length) {
            let envelope = hexToMicheline(hex.substring(offset));
            buffer.push(envelope.code);
            consumed += envelope.consumed / 2; // plain bytes
            offset += envelope.consumed; // hex-encoded two-char bytes
          }
          code += `[ ${buffer.join(', ')} ]`;
          offset += consumed;
          break;
        }
        case '03': {
          code += `{ "prim": ${michelineHexToKeyword(hex, offset)} }`;
          offset += 2;
          break;
        }
        case '04': {
          code += `{ "prim": ${michelineHexToKeyword(hex, offset)}, `;
          offset += 2;
          const annEnvelope = michelineHexToAnnotations(hex.substring(offset));
          code += `"annots": [ ${annEnvelope.code} ] }`;
          offset += annEnvelope.consumed;
          break;
        }
        case '05': {
          code += `{ "prim": ${michelineHexToKeyword(hex, offset)}, `;
          offset += 2;
          const envelope = hexToMicheline(hex.substring(offset));
          code += `"args": [ ${envelope.code} ] }`;
          offset += envelope.consumed;
          break;
        }
        case '06': {
          code += `{ "prim": ${michelineHexToKeyword(hex, offset)}, `;
          offset += 2;

          const args = hexToMicheline(hex.substring(offset));
          code += `"args": [ ${args.code} ], `;
          offset += args.consumed;

          const anns = michelineHexToAnnotations(hex.substring(offset));
          if (anns.code.length > 2) { // more than empty quotes
            code += `"annots": [ ${anns.code} ] }`;
          } else {
            code += ' }';
          }
          break;
        }
        case '07': {
          code += `{ "prim": ${michelineHexToKeyword(hex, offset)}, `;
          offset += 2;

          let buffer: string[] = [];
          let envelope = hexToMicheline(hex.substring(offset));
          buffer.push(envelope.code);
          offset += envelope.consumed;
          envelope = hexToMicheline(hex.substring(offset));
          buffer.push(envelope.code);
          offset += envelope.consumed;

          code += `"args": [ ${buffer.join(', ')} ] }`;
          break;
        }
        
        case '08': {
          //{ "prim": "NIL", "args": [ { "prim": "operation" }, { "prim": "operation" } ], "annots": [ "@cba" ] } => 083d036d036d0000000440636261
          code += `{ "prim": ${michelineHexToKeyword(hex, offset)}, `;
          offset += 2;

          const arg0 = hexToMicheline(hex.substring(offset));
          offset += arg0.consumed;
          const arg1 = hexToMicheline(hex.substring(offset));
          offset += arg1.consumed;
          code += `"args": [ ${arg0.code}, ${arg1.code} ], `;

          const anns = michelineHexToAnnotations(hex.substring(offset));
          if (anns.code.length > 2) { // more than empty quotes
            code += `"annots": [ ${anns.code} ] }`;
          } else {
            code += ' }';
          }
          break;
        }
        case '09': {
          code += `{ "prim": ${michelineHexToKeyword(hex, offset)}, `;
          offset += 2;

          let buffer: string[] = [];
          while (offset !== hex.length) {
            let envelope = hexToMicheline(hex.substring(offset));
            buffer.push(envelope.code);
            offset += envelope.consumed;
            if (hex.substring(offset, offset + 2) === '00') {
              const annEnvelope = michelineHexToAnnotations(hex.substring(offset));
              if (annEnvelope.code.length > 2) { // more than empty quotes
                buffer.push(`"annots": [ ${annEnvelope.code} ] }`);
              }
              offset += annEnvelope.consumed;
            }
          }
          code += `"args": [ ${buffer.join(', ')} ] }`;
          break;
        }
        case '10': {
          break;
        }
        default: { throw new Error(`Unknown Micheline field type ${fieldType}`); }
      }

      return { code: code, consumed: offset };
    }

    /**
     * Converts a Micheline-encoded ASCII string from hex. First 4 bytes are treated as length, followed by n-byte string.
     */
    function michelineHexToString(hex: string): codeEnvelope {
      let offset = 0;
      const length = parseInt(hex.substring(offset, offset + 8), 16);
      offset += 8;
      const text = Buffer.from(hex.substring(offset, offset + length * 2), 'hex').toString();
      offset += length * 2
      return {code: text, consumed: offset };
    }

    function michelineHexToKeyword(hex: string, offset: number): string {
      return MichelineKeywords[parseInt(hex.substring(offset, offset + 2), 16)];
    }

    function michelineHexToAnnotations(hex: string): codeEnvelope {
      const stringEnvelope = michelineHexToString(hex);
      return { code: stringEnvelope.code.split(' @').map((s, i) => i > 0 ? `"@${s}"`: `"${s}"`).join(', '), consumed: stringEnvelope.consumed };
    }

    interface codeEnvelope {
      code: string,
      consumed: number
    }
}

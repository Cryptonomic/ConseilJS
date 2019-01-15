import base58check from "bs58check";
import baseN from "base-n";

const base128 = baseN.create({
  characters: [...Array(128).keys()].map(k => ("0" + k.toString(16)).slice(-2))
});

export namespace TezosMessageUtils {
  /**
   * Encodes an integer into hex after converting it to Zarith format.
   * @param {number} value Number to be obfuscated.
   */
  export function writeInt(value: number): string {
    //@ts-ignore
    return Buffer.from(base128.encode(parseInt(value)), "hex")
      .map((v, i) => {
        return i == 0 ? v : v ^ 0x80;
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
          return i == 0 ? v : v & 0x7f;
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
      i++;

      if (parseInt(part, 16) < 127) {
        break;
      }
    }

    return { value: readInt(buffer), length: i * 2 };
  }

  /**
   * Takes a bounded hex string that is known to contain a Tezos address and decodes it.
   * @param {string} hex Encoded message part.
   * @param {string} type Tezos address type, one of 'tz1' or 'kt1'.
   */
  export function readAddress(hex: string, type: string = "tz1"): string {
    if (hex.length !== 40) { throw new Error("Incorrect hex length to parse an address."); }

    return type === "tz1" ? base58check.encode(Buffer.from("06a19f" + hex, "hex")) : base58check.encode(Buffer.from("025a79" + hex, "hex"));
  }

  /**
   * Encodes a Tezos address to hex, stripping off the top 3 bytes which contain address type, either 'tz1' or 'kt1'. Message format contains hints on address type.
   * @param {string} address Base58 address to encode.
   * @returns {string} Hex represntaton of a Tezos address.
   */
  export function writeAddress(address: string): string {
    return base58check.decode(address).slice(3).toString("hex");
  }

  /**
   * Reads the branch hash from the provided, bounded hex string.
   * @param {string} hex Encoded message part.
   */
  export function readBranch(hex: string): string {
    if (hex.length !== 64) { throw new Error("Incorrect hex length to parse a branch hash."); }
    return base58check.encode(Buffer.from(hex, "hex"));
  }

  /**
   * Encodes the branch hash to hex.
   * @param {string} branch Branch hash.
   * @returns {string} Hex represntaton of the Base58 branch hash.
   */
  export function writeBranch(branch: string): string {
    return base58check.decode(branch).toString("hex");
  }

  /**
   * Reads the key hash from the provided, bounded hex string.
   * @param {string} hex Encoded message part.
   * @returns {string} Key.
   */
  export function readKey(hex: string): string {
    if (hex.length !== 64) { throw new Error("Incorrect hex length to parse a key."); }
    return base58check.encode(Buffer.from(hex, "hex"));
  }
}

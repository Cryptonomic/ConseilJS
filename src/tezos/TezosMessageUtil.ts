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
  export function writeInt(value: number) {
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
  export function readInt(hex: string) {
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
   * Takes a hex string and reads a number starting at provided offset. Returns the number itself and the number of characters that were used to decode it.
   * @param {string} hex 
   * @param {number} hex 
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
   * Determine address type for both receiver and source
   * @param {string} hex  Address converted from binary to hex
   * @param {string} type  Binary returned by the Tezos node
   */
  export function readAddress(hex: string, type: string = "tz1") {
    // check for 40 chars
    return type === "tz1"
      ? base58check.encode(Buffer.from("06a19f" + hex, "hex"))
      : null;
  }

  /**
   * Convert address string to hex
   * @param {string} address
   */
  export function writeAddress(address: string) {
    return base58check
      .decode(address)
      .slice(3)
      .toString("hex");
  }

  /**
   * [some description here]
   * @param {string} hex
   */
  export function readBranch(hex: string) {
    // check for 64 chars
    return base58check.encode(Buffer.from(hex, "hex"));
  }

  /**
   * [some description here]
   * @param {string} hex
   */
  export function writeBranch(address: string) {
    return base58check.decode(address).toString("hex");
  }
}

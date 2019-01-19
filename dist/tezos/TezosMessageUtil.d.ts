/**
 * A collection of functions to encode and decode various Tezos P2P message components like amounts, addresses, hashes, etc.
 */
export declare namespace TezosMessageUtils {
    /**
     * Encodes a boolean as 0 or 255 by calling writeInt.
     * @param {boolean} value
     */
    function writeBoolean(value: boolean): string;
    /**
     * Takes a bounded hex string that is known to contain a boolean and decodes it as int.
     * @param {string} hex Encoded message part.
     */
    function readBoolean(hex: string): boolean;
    /**
     * Encodes an integer into hex after converting it to Zarith format.
     * @param {number} value Number to be obfuscated.
     */
    function writeInt(value: number): string;
    /**
     * Takes a bounded hex string that is known to contain a number and decodes the int.
     * @param {string} hex Encoded message part.
     */
    function readInt(hex: string): number;
    /**
     * Takes a hex string and reads a hex-encoded Zarith-formatted number starting at provided offset. Returns the number itself and the number of characters that were used to decode it.
     * @param {string} hex Encoded message.
     * @param {number} offset Offset within the message to start decoding from.
     */
    function findInt(hex: string, offset: number): {
        value: number;
        length: number;
    };
    /**
     * Takes a bounded hex string that is known to contain a Tezos address and decodes it. Supports implicit tz1, tz2, tz3 accounts and originated kt1.
     * @param {string} hex Encoded message part.
     */
    function readAddress(hex: string): string;
    /**
     * Encodes a Tezos address to hex, stripping off the top 3 bytes which contain address type, either 'tz1' or 'kt1'. Message format contains hints on address type.
     * @param {string} address Base58 address to encode.
     * @returns {string} Hex representation of a Tezos address.
     */
    function writeAddress(address: string): string;
    /**
     * Reads the branch hash from the provided, bounded hex string.
     * @param {string} hex Encoded message part.
     */
    function readBranch(hex: string): string;
    /**
     * Encodes the branch hash to hex.
     * @param {string} branch Branch hash.
     * @returns {string} Hex represntaton of the Base58 branch hash.
     */
    function writeBranch(branch: string): string;
    /**
     * Reads the key from the provided, bounded hex string.
     * @param {string} hex Encoded message part.
     * @returns {string} Key.
     */
    function readPublicKey(hex: string): string;
    /**
     * Encodes a public key
     */
    function writePublicKey(publicKey: string): string;
    /**
     * Reads the key hash from the provided, bounded hex string.
     * @param {string} hex Encoded message part.
     * @returns {string} Key hash.
     */
    function readPublicKeyHash(hex: string): string;
}

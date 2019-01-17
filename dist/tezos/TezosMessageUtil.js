"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/*eslint no-bitwise: 0*/
const bs58check_1 = __importDefault(require("bs58check"));
const base_n_1 = __importDefault(require("base-n"));
const base128 = base_n_1.default.create({
    characters: [...Array(128).keys()].map(k => ("0" + k.toString(16)).slice(-2))
});
var TezosMessageUtils;
(function (TezosMessageUtils) {
    /**
     * Encodes a boolean as 0 or 255 by calling writeInt.
     * @param {boolean} value
     */
    function writeBoolean(value) {
        return value ? "ff" : "00";
    }
    TezosMessageUtils.writeBoolean = writeBoolean;
    /**
     * Takes a bounded hex string that is known to contain a boolean and decodes it as int.
     * @param {string} hex Encoded message part.
     */
    function readBoolean(hex) {
        return parseInt(hex, 16) > 0 ? true : false;
    }
    TezosMessageUtils.readBoolean = readBoolean;
    /**
     * Encodes an integer into hex after converting it to Zarith format.
     * @param {number} value Number to be obfuscated.
     */
    function writeInt(value) {
        //@ts-ignore
        return Buffer.from(base128.encode(parseInt(value, 10)), "hex")
            .map((v, i) => {
            return i == 0 ? v : v ^ 0x80;
        })
            .reverse()
            .toString("hex");
    }
    TezosMessageUtils.writeInt = writeInt;
    /**
     * Takes a bounded hex string that is known to contain a number and decodes the int.
     * @param {string} hex Encoded message part.
     */
    function readInt(hex) {
        return base128.decode(
        //@ts-ignore
        Buffer.from(hex, "hex")
            .reverse()
            .map((v, i) => {
            return i == 0 ? v : v & 0x7f;
        })
            .toString("hex"));
    }
    TezosMessageUtils.readInt = readInt;
    /**
     * Takes a hex string and reads a hex-encoded Zarith-formatted number starting at provided offset. Returns the number itself and the number of characters that were used to decode it.
     * @param {string} hex Encoded message.
     * @param {number} offset Offset within the message to start decoding from.
     */
    function findInt(hex, offset) {
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
    TezosMessageUtils.findInt = findInt;
    /**
     * Takes a bounded hex string that is known to contain a Tezos address and decodes it.
     * @param {string} hex Encoded message part.
     * @param {string} type Tezos address type, one of 'tz1' or 'kt1'.
     */
    function readAddress(hex, type = "tz1") {
        if (hex.length !== 40) {
            throw new Error("Incorrect hex length to parse an address.");
        }
        switch (type) {
            case "tz1": return bs58check_1.default.encode(Buffer.from("06a19f" + hex, "hex"));
            case "tz2": return bs58check_1.default.encode(Buffer.from("06a1a1" + hex, "hex"));
            case "tz3": return bs58check_1.default.encode(Buffer.from("06a1a4" + hex, "hex"));
            case "kt1": return bs58check_1.default.encode(Buffer.from("025a79" + hex, "hex"));
            default: throw new Error("Unrecognized address type");
        }
    }
    TezosMessageUtils.readAddress = readAddress;
    /**
     * Encodes a Tezos address to hex, stripping off the top 3 bytes which contain address type, either 'tz1' or 'kt1'. Message format contains hints on address type.
     * @param {string} address Base58 address to encode.
     * @returns {string} Hex represntaton of a Tezos address.
     */
    function writeAddress(address) {
        return bs58check_1.default.decode(address).slice(3).toString("hex");
    }
    TezosMessageUtils.writeAddress = writeAddress;
    /**
     * Reads the branch hash from the provided, bounded hex string.
     * @param {string} hex Encoded message part.
     */
    function readBranch(hex) {
        if (hex.length !== 64) {
            throw new Error("Incorrect hex length to parse a branch hash.");
        }
        return bs58check_1.default.encode(Buffer.from(hex, "hex"));
    }
    TezosMessageUtils.readBranch = readBranch;
    /**
     * Encodes the branch hash to hex.
     * @param {string} branch Branch hash.
     * @returns {string} Hex represntaton of the Base58 branch hash.
     */
    function writeBranch(branch) {
        return bs58check_1.default.decode(branch).toString("hex");
    }
    TezosMessageUtils.writeBranch = writeBranch;
    /**
     * Reads the key hash from the provided, bounded hex string.
     * @param {string} hex Encoded message part.
     * @returns {string} Key.
     */
    function readKey(hex, type = "ed") {
        if (hex.length !== 64) {
            throw new Error("Incorrect hex length to parse a key.");
        }
        return bs58check_1.default.encode(Buffer.from(hex, "hex"));
    }
    TezosMessageUtils.readKey = readKey;
})(TezosMessageUtils = exports.TezosMessageUtils || (exports.TezosMessageUtils = {}));
//# sourceMappingURL=TezosMessageUtil.js.map
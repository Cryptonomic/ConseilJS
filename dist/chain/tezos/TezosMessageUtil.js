"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bs58check_1 = __importDefault(require("bs58check"));
const base_n_1 = __importDefault(require("base-n"));
const base128 = base_n_1.default.create({
    characters: [...Array(128).keys()].map(k => ("0" + k.toString(16)).slice(-2))
});
var TezosMessageUtils;
(function (TezosMessageUtils) {
    function writeBoolean(value) {
        return value ? "ff" : "00";
    }
    TezosMessageUtils.writeBoolean = writeBoolean;
    function readBoolean(hex) {
        return parseInt(hex, 16) > 0 ? true : false;
    }
    TezosMessageUtils.readBoolean = readBoolean;
    function writeInt(value) {
        return Buffer.from(base128.encode(parseInt(value, 10)), "hex")
            .map((v, i) => {
            return i === 0 ? v : v ^ 0x80;
        })
            .reverse()
            .toString("hex");
    }
    TezosMessageUtils.writeInt = writeInt;
    function readInt(hex) {
        return base128.decode(Buffer.from(hex, "hex")
            .reverse()
            .map((v, i) => {
            return i === 0 ? v : v & 0x7f;
        })
            .toString("hex"));
    }
    TezosMessageUtils.readInt = readInt;
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
    function readAddress(hex) {
        if (hex.length !== 44 && hex.length !== 42) {
            throw new Error("Incorrect hex length to parse an address.");
        }
        let implicitHint = hex.length === 44 ? hex.substring(0, 4) : "00" + hex.substring(0, 2);
        let implicitPrefixLength = hex.length === 44 ? 4 : 2;
        if (implicitHint === "0000") {
            return bs58check_1.default.encode(Buffer.from("06a19f" + hex.substring(implicitPrefixLength), "hex"));
        }
        else if (implicitHint === "0001") {
            return bs58check_1.default.encode(Buffer.from("06a1a1" + hex.substring(implicitPrefixLength), "hex"));
        }
        else if (implicitHint === "0002") {
            return bs58check_1.default.encode(Buffer.from("06a1a4" + hex.substring(implicitPrefixLength), "hex"));
        }
        else if (hex.substring(0, 2) === "01" && hex.length === 44) {
            return bs58check_1.default.encode(Buffer.from("025a79" + hex.substring(2, 42), "hex"));
        }
        else {
            throw new Error("Unrecognized address type");
        }
    }
    TezosMessageUtils.readAddress = readAddress;
    function writeAddress(address) {
        const hex = bs58check_1.default.decode(address).slice(3).toString("hex");
        if (address.startsWith("tz1")) {
            return "0000" + hex;
        }
        else if (address.startsWith("tz2")) {
            return "0001" + hex;
        }
        else if (address.startsWith("tz3")) {
            return "0002" + hex;
        }
        else if (address.startsWith("KT1")) {
            return "01" + hex + "00";
        }
        else {
            throw new Error("Unrecognized address type.");
        }
    }
    TezosMessageUtils.writeAddress = writeAddress;
    function readBranch(hex) {
        if (hex.length !== 64) {
            throw new Error("Incorrect hex length to parse a branch hash.");
        }
        return bs58check_1.default.encode(Buffer.from(hex, "hex"));
    }
    TezosMessageUtils.readBranch = readBranch;
    function writeBranch(branch) {
        return bs58check_1.default.decode(branch).toString("hex");
    }
    TezosMessageUtils.writeBranch = writeBranch;
    function readPublicKey(hex) {
        if (hex.length !== 66 && hex.length !== 68) {
            throw new Error("Incorrect hex length to parse a key.");
        }
        let hint = hex.substring(0, 2);
        if (hint === "00") {
            return bs58check_1.default.encode(Buffer.from("0d0f25d9" + hex.substring(2), "hex"));
        }
        else if (hint === "01" && hex.length === 68) {
            return bs58check_1.default.encode(Buffer.from("03fee256" + hex.substring(2), "hex"));
        }
        else if (hint === "02" && hex.length === 68) {
            return bs58check_1.default.encode(Buffer.from("03b28b7f" + hex.substring(2), "hex"));
        }
        else {
            throw new Error("Unrecognized key type");
        }
    }
    TezosMessageUtils.readPublicKey = readPublicKey;
    function writePublicKey(publicKey) {
        if (publicKey.startsWith("edpk")) {
            return "00" + bs58check_1.default.decode(publicKey).slice(4).toString("hex");
        }
        else if (publicKey.startsWith("sppk")) {
            return "01" + bs58check_1.default.decode(publicKey).slice(4).toString("hex");
        }
        else if (publicKey.startsWith("p2pk")) {
            return "02" + bs58check_1.default.decode(publicKey).slice(4).toString("hex");
        }
        else {
            throw new Error("Unrecognized key type");
        }
    }
    TezosMessageUtils.writePublicKey = writePublicKey;
    function readPublicKeyHash(hex) {
        if (hex.length !== 42) {
            throw new Error("Incorrect hex length to parse a key.");
        }
        let hint = hex.substring(0, 2);
        if (hint === "00") {
            return bs58check_1.default.encode(Buffer.from("0d0f25d9" + hex.substring(2), "hex"));
        }
        else if (hint === "01") {
            return bs58check_1.default.encode(Buffer.from("03fee256" + hex.substring(2), "hex"));
        }
        else if (hint === "02") {
            return bs58check_1.default.encode(Buffer.from("03b28b7f" + hex.substring(2), "hex"));
        }
        else {
            throw new Error("Unrecognized hash type");
        }
    }
    TezosMessageUtils.readPublicKeyHash = readPublicKeyHash;
})(TezosMessageUtils = exports.TezosMessageUtils || (exports.TezosMessageUtils = {}));
//# sourceMappingURL=TezosMessageUtil.js.map
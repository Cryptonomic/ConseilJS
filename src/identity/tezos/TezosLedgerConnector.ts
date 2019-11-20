import Transport from "@ledgerhq/hw-transport";
import * as bip32path from 'bip32-path';

export enum Curve {
    ED25519 = 0x00,
    SECP256K1 = 0x01,
    SECP256R1 = 0x02
};

export enum Instruction { // taken from https://github.com/obsidiansystems/ledger-app-tezos/blob/master/APDUs.md
    INS_VERSION = 0x00,
    INS_GET_PUBLIC_KEY = 0x02,
    INS_PROMPT_PUBLIC_KEY = 0x03,
    INS_SIGN = 0x04,
    INS_SIGN_UNSAFE = 0x05
}

export default class TezosLedgerConnector {
    transport: Transport<*>;

    constructor(transport: Transport<*>) {
        this.transport = transport;
        transport.decorateAppAPIMethods(this, ["getAddress", "signOperation", "signHash", "getVersion"], "XTZ");
    }

    /**
     * Get Tezos public key hash for a given BIP32 path.
     * 
     * @param path 
     * @param boolDisplay 
     * @param curve 
     */
    async getAddress(path: string, boolDisplay: boolean = true, curve: Curve = Curve.ED25519): Promise<string> {
        if (!path.startsWith("44'/1729'")) {
            throw new Error(`Tezos derivation paths must start with '44'/1729': ${path}`);
        }

        const cla = 0x80;
        const p1 = 0;
        const p2 = curve || 0;

        const payload = await this.transport.send(cla, boolDisplay ? Instruction.INS_PROMPT_PUBLIC_KEY : Instruction.INS_GET_PUBLIC_KEY, p1, p2, this.pathToBuffer(path));
        const publicKey = payload.slice(1, 1 + payload[0]);

        return publicKey.toString("hex");
    }

    async sign(path: string, rawTxHex: string, curve: Curve, apdu: number): Promise<string> {
        const bytes = Buffer.from(rawTxHex, "hex");
        let message: Buffer[] = [];

        message.push(this.pathToBuffer(path));

        const maxChunkSize = 255;
        for (let offset = 0, part = 0; offset !== bytes.length; offset += part) {
            part = offset + maxChunkSize > bytes.length ? bytes.length - offset : maxChunkSize;

            const buffer = Buffer.alloc(part);
            bytes.copy(buffer, 0, offset, offset + part);
            message.push(buffer);
        }

        let response = await this.transport.send(0x80, apdu, 0x00, curve, message[0]);
        for (let i = 1; i < message.length; i++) {
            let code = (i === message.length - 1) ? 0x81 : 0x01;
            response = await this.transport.send(0x80, apdu, code, curve, message[i]);
        }

        const signature = response.slice(0, response.length - 2).toString("hex");

        return signature;
    }

    async signOperation(path: string, hex: string, curve: Curve = Curve.ED25519): Promise<string> {
        return this.sign(path, hex, curve, Instruction.INS_SIGN);
    }

    async signHash(path: string, hex: string, curve: Curve = Curve.ED25519): Promise<string> {
        return this.sign(path, hex, curve, Instruction.INS_SIGN_UNSAFE);
    }

    async getVersionString(): Promise<string> {
        const [appFlag, major, minor, patch] = await this.transport.send(0x80, Instruction.INS_VERSION, 0x00, 0x00, new Buffer(0));
        return `${major}.${minor}.${patch}${appFlag === 1 ? ' baker' : ''}`;
    }

    private pathToBuffer(path: string): Buffer {
        let pathArray = bip32path.fromString(path).toPathArray();
        let buffer = Buffer.alloc(1 + pathArray.length * 4);
        buffer[0] = pathArray.length;
        pathArray.forEach((element, index) => {
            buffer.writeUInt32BE(element, 1 + 4 * index);
        });

        return buffer;
    }
}
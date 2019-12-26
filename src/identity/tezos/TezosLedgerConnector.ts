import Transport from "@ledgerhq/hw-transport";
import * as bip32path from 'bip32-path';

export enum Curve { // taken from https://github.com/obsidiansystems/ledger-app-tezos/blob/master/APDUs.md
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
     * Get Tezos public key hash for a given BIP32/44 path and curve. Convention for Tezos derivation paths is 44'/1729'/n'/n'/n'.
     * 
     * @param {string} path BIP32/44 derivation path
     * @param {boolean} prompt Prompt the user to provide the key on the hardware device, default true.
     * @param {Curve} curve Curve to use for key generation, one of: ED25519 (default), SECP256K1, SECP256R1
     */
    async getAddress(path: string, prompt: boolean = true, curve: Curve = Curve.ED25519): Promise<string> {
        const payload = await this.transport.send(0x80, prompt ? Instruction.INS_PROMPT_PUBLIC_KEY : Instruction.INS_GET_PUBLIC_KEY, 0x00, curve, this.pathToBuffer(path));
        const publicKey = payload.slice(1, 1 + payload[0]);

        return publicKey.toString("hex");
    }

    /**
     * Signs an operation hex, will attempt to parse the parameters and present them to the user.
     * 
     * @param {string} path BIP32/44 derivation path
     * @param {string} hex Operation hex
     * @param {Curve} curve Curve, defaults to ED25519
     */
    async signOperation(path: string, hex: string, curve: Curve = Curve.ED25519): Promise<string> {
        return this.sign(path, curve, Instruction.INS_SIGN, hex);
    }

    /**
     * Signs a hex string without attempting to parse it on the device for parameter verification by the user.
     * 
     * @param {string} path BIP32/44 derivation path 
     * @param {string} hex Hex
     * @param {Curve} curve Curve, defaults to ED25519
     */
    async signHex(path: string, hex: string, curve: Curve = Curve.ED25519): Promise<string> {
        return this.sign(path, curve, Instruction.INS_SIGN_UNSAFE, hex);
    }

    /**
     * Gets the version of the Tezos application running on the Ledger device.
     */
    async getVersionString(): Promise<string> {
        const [appFlag, major, minor, patch] = await this.transport.send(0x80, Instruction.INS_VERSION, 0x00, 0x00, new Buffer(0));
        return `${major}.${minor}.${patch}${appFlag === 1 ? ' baker' : ''}`;
    }

    private async sign(path: string, curve: Curve, instruction: number, hex: string, ): Promise<string> {
        const bytes = Buffer.from(hex, "hex");
        let message: Buffer[] = [];

        message.push(this.pathToBuffer(path));

        const maxChunkSize = 255;
        for (let offset = 0, part = 0; offset !== bytes.length; offset += part) {
            part = offset + maxChunkSize > bytes.length ? bytes.length - offset : maxChunkSize;

            const buffer = Buffer.alloc(part);
            bytes.copy(buffer, 0, offset, offset + part);
            message.push(buffer);
        }

        let response = await this.transport.send(0x80, instruction, 0x00, curve, message[0]);
        for (let i = 1; i < message.length; i++) {
            let code = (i === message.length - 1) ? 0x81 : 0x01;
            response = await this.transport.send(0x80, instruction, code, curve, message[i]);
        }

        const signature = response.slice(0, response.length - 2).toString("hex");

        return signature;
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

import { Transport } from '@ledgerhq/hw-transport-node-hid';
import { Signer, TezosMessageUtils } from '../../ConseilJS-core';

import * as TezosLedgerConnector from './TezosLedgerConnector'

/**
 *  
 */
export class LedgerSigner implements Signer {
    static transport = null;

    static async getInstance() {
        if (this.transport === null) {
            this.transport = await Transport.create();
        }
        return this.transport
    }

    readonly derivationPath: string;

    constructor(derivationPath: string) {
        LedgerSigner.transport = null;

        this.derivationPath = derivationPath;
    }

    /**
     * Given a BIP44 derivation path for Tezos, and the hex encoded, watermarked Tezos Operation, sign using the ledger
     * 
     * @param derivationPath BIP44 Derivation Path
     * @param watermarkedOpInHex Operation
     */
    public async sign(bytes: Buffer): Promise<Buffer> {
        const transport = await LedgerSigner.getInstance();
        const xtz = new TezosLedgerConnector(transport);
        const result = await xtz.signOperation(this.derivationPath, bytes);
        const signatureBytes = Buffer.from(result, 'hex');

        return signatureBytes;
    }

    /**
     * Signs arbitrary text using Ledger devices.
     * 
     * @param message UTF-8 test.
     * @returns {Promise<string>} base58check-encoded signature prefixed with 'edsig'.
     */
    public async signText(message: string): Promise<string> {
        const transport = await LedgerSigner.getInstance();
        const xtz = new TezosLedgerConnector(transport);
        const result = await xtz.signHex(this.derivationPath, Buffer.from(message, 'utf8').toString('hex'));
        const messageSig = Buffer.from(result, 'hex');

        return TezosMessageUtils.readSignatureWithHint(messageSig, 'edsig');
    }
}

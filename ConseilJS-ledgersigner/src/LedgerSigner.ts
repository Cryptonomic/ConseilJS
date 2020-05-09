import { Transport } from '@ledgerhq/hw-transport-node-hid';
import { Signer, TezosMessageUtils } from '../../ConseilJS-core';

import { TezosLedgerConnector } from './TezosLedgerConnector'

/**
 *  
 */
export class LedgerSigner implements Signer {
    readonly derivationPath: string;
    readonly connector: TezosLedgerConnector;

    constructor(connector: TezosLedgerConnector, derivationPath: string) {
        this.connector = connector;
        this.derivationPath = derivationPath;
    }

    /**
     * Given a BIP44 derivation path for Tezos, and the hex encoded, watermarked Tezos Operation, sign using the ledger
     * 
     * @param derivationPath BIP44 Derivation Path
     * @param watermarkedOpInHex Operation
     */
    public async sign(bytes: Buffer): Promise<Buffer> {
        const result = await this.connector.signOperation(this.derivationPath, bytes);
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
        const result = await this.connector.signHex(this.derivationPath, Buffer.from(message, 'utf8'));
        const messageSig = Buffer.from(result, 'hex');

        return TezosMessageUtils.readSignatureWithHint(messageSig, 'edsig');
    }
}

/// <reference types="node" />
export declare function initLedgerTransport(): void;
export declare function getTezosPublicKey(derivationPath: string): Promise<string>;
export declare function signTezosOperation(derivationPath: string, watermarkedOpInHex: string): Promise<Buffer>;

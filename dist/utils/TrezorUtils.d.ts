/// <reference types="node" />
/**
 * Given a BIP44 derivation path for Tezos, get the Tezos Public Key
 * @param derivationPath BIP44 Derivation Path
 */
export declare function getTezosPublicKey(derivationPath: string): Promise<any>;
export declare function signTezosOperation(derivationPath: string, forgedOperation: string, operations: object[]): Promise<Buffer>;

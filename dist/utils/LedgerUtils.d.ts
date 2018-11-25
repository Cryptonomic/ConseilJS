/// <reference types="node" />
/**
    initialize of transport
*/
export declare function initLedgerTransport(): void;
/**
 * Given a BIP44 derivation path for Tezos, get the Tezos Public Key
 * @param derivationPath BIP44 Derivation Path
 */
export declare function getTezosPublicKey(derivationPath: string): Promise<string>;
/**
 * Given a BIP44 derivation path for Tezos, get the Tezos Public Key
 * @param derivationPath BIP44 Derivation Path
 */
export declare function getTezosPublicKeyOnHidden(derivationPath: string): Promise<string>;
/**
 * Given a BIP44 derivation path for Tezos, and the hex encoded, watermarked
 * Tezos Operation, sign using the ledger
 * @param derivationPath BIP44 Derivation Path
 * @param watermarkedOpInHex Operation
 */
export declare function signTezosOperation(derivationPath: string, watermarkedOpInHex: string): Promise<Buffer>;

export declare namespace Utility {
    const mergebuf: (b1: any, b2: any) => Uint8Array;
    const b58cdecode: (enc: any, prefix: any) => any;
    const buf2hex: (buffer: any) => string;
    const hex2buf: (hex: any) => Uint8Array;
    const getSource: (address: string) => {
        tag: number;
        hash: any;
    };
    const getParameter: (address: any, opbytes: any) => false | Uint8Array;
    const getOperations: (ops: any, forgedOperation: any) => void | any[];
}
/**
 * Given a BIP44 derivation path for Tezos, get the Tezos Public Key
 * @param derivationPath BIP44 Derivation Path
 */
export declare function getTezosPublicKey(derivationPath: string): Promise<any>;
export declare function signTezosOperation(derivationPath: string, operations: object[], hash: string, forgedOperation: string): Promise<any>;

import { SignedOperationGroup } from '../../types/tezos/TezosChainTypes';
export declare namespace TezosMessageUtils {
    function writeBoolean(value: boolean): string;
    function readBoolean(hex: string): boolean;
    function writeInt(value: number): string;
    function readInt(hex: string): number;
    function findInt(hex: string, offset: number): {
        value: number;
        length: number;
    };
    function readAddress(hex: string): string;
    function readAddressWithHint(b: Buffer | Uint8Array, hint: string): string;
    function writeAddress(address: string): string;
    function readBranch(hex: string): string;
    function writeBranch(branch: string): string;
    function readPublicKey(hex: string): string;
    function writePublicKey(publicKey: string): string;
    function readKeyWithHint(b: Buffer | Uint8Array, hint: string): string;
    function writeKeyWithHint(b: string, hint: string): Buffer;
    function readSignatureWithHint(b: Buffer | Uint8Array, hint: string): string;
    function readBufferWithHint(b: Buffer | Uint8Array, hint: string): string;
    function writeBufferWithHint(b: string, hint: string): Buffer;
    function computeOperationHash(signedOpGroup: SignedOperationGroup): string;
    function computeKeyHash(key: Buffer, prefix?: string): string;
}

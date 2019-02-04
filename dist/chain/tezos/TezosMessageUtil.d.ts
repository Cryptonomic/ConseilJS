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
    function writeAddress(address: string): string;
    function readBranch(hex: string): string;
    function writeBranch(branch: string): string;
    function readPublicKey(hex: string): string;
    function writePublicKey(publicKey: string): string;
    function readPublicKeyHash(hex: string): string;
}

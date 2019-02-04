import { Wallet } from "../../types/wallet/Wallet";
export declare namespace TezosFileWallet {
    function saveWallet(filename: string, wallet: Wallet, passphrase: string): Promise<Wallet>;
    function loadWallet(filename: string, passphrase: string): Promise<Wallet>;
    function createWallet(filename: string, password: string): Promise<any>;
}

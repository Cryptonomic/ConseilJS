import { Wallet } from "../types/wallet/Wallet";
import { KeyStore } from "../types/wallet/KeyStore";
import { Error } from "../types/wallet/Error";
export declare namespace TezosWallet {
    function saveWallet(filename: string, wallet: Wallet, passphrase: string): Promise<Wallet>;
    function loadWallet(filename: string, passphrase: string): Promise<Wallet>;
    function createWallet(filename: string, password: string): Promise<any>;
    function unlockFundraiserIdentity(mnemonic: string, email: string, password: string, pkh: string): KeyStore | Error;
    function generateMnemonic(): string;
    function unlockIdentityWithMnemonic(mnemonic: string, passphrase: string): KeyStore | Error;
}

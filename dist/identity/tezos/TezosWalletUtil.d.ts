import { KeyStore } from "../../types/wallet/KeyStore";
import { Error } from "../../types/wallet/Error";
export declare namespace TezosWalletUtil {
    function unlockFundraiserIdentity(mnemonic: string, email: string, password: string, pkh: string): KeyStore | Error;
    function generateMnemonic(): string;
    function unlockIdentityWithMnemonic(mnemonic: string, passphrase: string): KeyStore | Error;
}

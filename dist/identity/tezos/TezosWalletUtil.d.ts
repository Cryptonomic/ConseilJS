import { KeyStore, StoreType } from "../../types/wallet/KeyStore";
import { Error } from "../../types/wallet/Error";
export declare namespace TezosWalletUtil {
    function unlockFundraiserIdentity(mnemonic: string, email: string, password: string, pkh: string): KeyStore | Error;
    function generateMnemonic(): string;
    function unlockIdentityWithMnemonic(mnemonic: string, passphrase: string): KeyStore | Error;
    function getKeysFromMnemonicAndPassphrase(mnemonic: string, passphrase: string, pkh: string | undefined, checkPKH: boolean | undefined, storeType: StoreType): Error | KeyStore;
}

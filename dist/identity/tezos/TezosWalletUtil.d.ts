import { KeyStore, StoreType } from '../../types/wallet/KeyStore';
export declare namespace TezosWalletUtil {
    function unlockFundraiserIdentity(mnemonic: string, email: string, password: string, pkh: string): Promise<KeyStore>;
    function generateMnemonic(): string;
    function unlockIdentityWithMnemonic(mnemonic: string, passphrase: string): Promise<KeyStore>;
    function getKeysFromMnemonicAndPassphrase(mnemonic: string, passphrase: string, pkh: string | undefined, checkPKH: boolean | undefined, storeType: StoreType): Promise<KeyStore>;
}

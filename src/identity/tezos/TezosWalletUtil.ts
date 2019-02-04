import {KeyStore, StoreType} from "../../types/wallet/KeyStore";
import {Error} from "../../types/wallet/Error";
import * as CryptoUtils from "../../utils/CryptoUtils";
import * as fs from "fs";

export namespace TezosWalletUtil {
    /**
     * Unlocks an identity supplied during the 2017 Tezos fundraiser.
     * 
     * @param {string} mnemonic Fifteen word mnemonic phrase from fundraiser PDF.
     * @param {string} email Email address from fundraiser PDF.
     * @param {string} password Password from fundraiser PDF.
     * @param {string} pkh The public key hash supposedly produced by the given mnemonic and passphrase
     * @returns {KeyStore} Wallet file
     */
    export function unlockFundraiserIdentity(
        mnemonic: string,
        email: string,
        password: string,
        pkh: string): KeyStore | Error {

        return CryptoUtils.getKeysFromMnemonicAndPassphrase(
            mnemonic,
            email + password,
            pkh,
            true,
            StoreType.Fundraiser
        )
    }

    /**
     * Generates a fifteen word mnemonic phrase using the BIP39 standard.
     */
    export function generateMnemonic(): string {
        return CryptoUtils.generateMnemonic();
    }

    /**
     * Generates a key pair based on a mnemonic.
     * 
     * @param {string} mnemonic Fifteen word memonic phrase
     * @param {string} passphrase User-supplied passphrase
     * @returns {KeyStore} Unlocked key pair
     */
    export function unlockIdentityWithMnemonic(mnemonic: string, passphrase: string): KeyStore | Error {
        return CryptoUtils.getKeysFromMnemonicAndPassphrase(
            mnemonic,
            passphrase,
            "",
            false,
            StoreType.Mnemonic
        );
    }
}
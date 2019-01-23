import * as ledgerUtils from "../utils/LedgerUtils";
import * as trezorUtils from '../utils/TrezorUtils';
import {HardwareDeviceType} from "../types/HardwareDeviceType";
import {base58CheckEncode} from "../utils/CryptoUtils";
import * as sodium  from 'libsodium-wrappers-sumo';
import {KeyStore, StoreType} from "../types/KeyStore";

export namespace TezosHardwareWallet {

    export async function unlockAddress(deviceType: HardwareDeviceType, derivationPath: string): Promise<KeyStore> {
        if (!deviceType) {
            const hexEncodedPublicKey = await ledgerUtils.getTezosPublicKey(derivationPath);
            // We slice off a byte to make sure we have a 64 bits coming in from the ledger package
            const publicKeyBytes = sodium.from_hex(hexEncodedPublicKey).slice(1);
            const publicKey = base58CheckEncode(publicKeyBytes, "edpk");
            const publicKeyHash = base58CheckEncode(sodium.crypto_generichash(20, publicKeyBytes), "tz1");
            return {
                publicKey: publicKey,
                privateKey: '',
                publicKeyHash: publicKeyHash,
                seed: '',
                storeType: StoreType.Hardware
            }
        } else {
            const {publicKey, address} = await trezorUtils.getTezosPublicKey(derivationPath);
            return {
                publicKey: publicKey,
                privateKey: '',
                publicKeyHash: address,
                seed: '',
                storeType: StoreType.Hardware
            }
        }
    }

    export function initLedgerTransport() {
        ledgerUtils.initLedgerTransport();
    }
}

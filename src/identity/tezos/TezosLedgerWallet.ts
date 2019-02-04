import * as ledgerUtils from "../utils/LedgerUtils";
import {HardwareDeviceType} from "../types/wallet/HardwareDeviceType";
import {base58CheckEncode} from "../utils/CryptoUtils";
import * as sodium from 'libsodium-wrappers-sumo';
import {KeyStore, StoreType} from "../types/wallet/KeyStore";

export namespace TezosHardwareWallet {
    export async function unlockAddress(deviceType: HardwareDeviceType, derivationPath: string): Promise<KeyStore> {
        if (deviceType === HardwareDeviceType.LedgerNanoS) {
            const hexEncodedPublicKey = await ledgerUtils.getTezosPublicKey(derivationPath);
            //We slice off a byte to make sure we have a 64 bits coming in from the ledger package
            const publicKeyBytes = sodium.from_hex(hexEncodedPublicKey).slice(1);
            const publicKey = base58CheckEncode(publicKeyBytes, "edpk");
            const publicKeyHash = base58CheckEncode(sodium.crypto_generichash(20, publicKeyBytes), "tz1");

            return { publicKey: publicKey, privateKey: '', publicKeyHash: publicKeyHash, seed: '', storeType: StoreType.Hardware };
        } else {
            throw new Error("Unsupported hardware device");
        }
    }

    export function initLedgerTransport() {
        ledgerUtils.initLedgerTransport();
    }
}

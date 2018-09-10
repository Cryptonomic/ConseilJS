import * as ledgerUtils from "../utils/LedgerUtils";
import {HardwareDeviceType} from "../types/HardwareDeviceType";
import {base58CheckEncode} from "../utils/CryptoUtils";
import * as sodium  from 'libsodium-wrappers-sumo';

export namespace TezosHardwareWallet {

    export async function unlockAddress(deviceType: HardwareDeviceType, derivationPath: string, index: number) {
        const publicKeyBytes = await ledgerUtils.getTezosPublicKey(derivationPath);
        return base58CheckEncode(sodium.crypto_generichash(20, publicKeyBytes), "tz1");
    }
}
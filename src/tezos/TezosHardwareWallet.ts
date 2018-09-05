import * as ledgerUtils from "../utils/LedgerUtils";
import {HardwareDeviceType} from "../types/HardwareDeviceType";
import {base58CheckEncode} from "../utils/CryptoUtils";
import * as sodium  from 'libsodium-wrappers-sumo';

export namespace TezosHardwareWallet {

    export async function unlockIdentity(deviceType: HardwareDeviceType, derivationPath: string, index: number) {
        const publicKey = await ledgerUtils.getPublicKey(derivationPath, index);
        const publicKeyBytes = sodium.from_hex(publicKey)
        const encodedPublicKey = base58CheckEncode(publicKeyBytes, "edpk");
        console.log(publicKeyBytes)
        console.log(publicKey)
        console.log(encodedPublicKey)
        return base58CheckEncode(sodium.crypto_generichash(20, publicKey), "tz1");
    }
}
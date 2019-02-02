import { HardwareDeviceType } from "../types/wallet/HardwareDeviceType";
import { KeyStore } from "../types/wallet/KeyStore";
export declare namespace TezosHardwareWallet {
    function unlockAddress(deviceType: HardwareDeviceType, derivationPath: string): Promise<KeyStore>;
    function initLedgerTransport(): void;
}

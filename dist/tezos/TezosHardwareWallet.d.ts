import { HardwareDeviceType } from "../types/HardwareDeviceType";
import { KeyStore } from "../types/KeyStore";
export declare namespace TezosHardwareWallet {
    function unlockAddress(deviceType: HardwareDeviceType, derivationPath: string): Promise<KeyStore>;
    function initLedgerTransport(): void;
    function getTezosPublicKey(derivationPath: any): Promise<string>;
}

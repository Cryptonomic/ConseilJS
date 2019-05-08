/// <reference types="node" />
import { HardwareDeviceType } from "../../types/wallet/HardwareDeviceType";
import { KeyStore } from "../../types/wallet/KeyStore";
export declare namespace TezosLedgerWallet {
    function unlockAddress(deviceType: HardwareDeviceType, derivationPath: string): Promise<KeyStore>;
    function getTezosPublicKey(derivationPath: string): Promise<string>;
    function signTezosOperation(derivationPath: string, watermarkedOpInHex: string): Promise<Buffer>;
    function initLedgerTransport(): void;
}

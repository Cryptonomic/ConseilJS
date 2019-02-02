import 'mocha';
import {expect} from 'chai';
import * as tezHardwareWallet from '../src/tezos/TezosHardwareWallet';
import {HardwareDeviceType} from "../src/types/wallet/HardwareDeviceType";

describe('getTezosPublicKey()', () => {
    it('should correctly fetch the root key', async () => {
        const derivationPath = "44'/1729'/0'/0'";
        const result = await tezHardwareWallet.TezosHardwareWallet.unlockAddress(
            HardwareDeviceType.LedgerNanoS,
            derivationPath);
        console.log(result)
    });
});


import 'mocha';
import {expect} from 'chai';
import * as tezHardwareWallet from '../../src/tezos/TezosHardwareWallet';
import {HardwareDeviceType} from "../../src/types/HardwareDeviceType";

describe('getPublicKey()', () => {
    it('should correctly fetch the root key', async () => {
        const derivationPath = "44'/1729'/0'/0'"
        const result = await tezHardwareWallet.TezosHardwareWallet.unlockAddress(
            HardwareDeviceType.Ledger,
            derivationPath,
            0)
        console.log(result)
    });
});


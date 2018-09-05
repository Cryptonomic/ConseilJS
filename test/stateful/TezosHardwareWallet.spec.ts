import 'mocha';
import {expect} from 'chai';
import * as tezHardwareWallet from '../../src/tezos/TezosHardwareWallet';
import {HardwareDeviceType} from "../../src/types/HardwareDeviceType";

describe('getPublicKey()', () => {
    it('should correctly fetch the root key', async () => {
        const result = await tezHardwareWallet.TezosHardwareWallet.unlockIdentity(
            HardwareDeviceType.Ledger,
            "44'/1729'/0'/0'",
            0)
        console.log(result)
    });
});


import 'mocha';
import {expect} from 'chai';
import {TezosHardwareWallet} from '../src/tezos/TezosHardwareWallet';
import {HardwareDeviceType} from "../src/types/HardwareDeviceType";

describe('getTezosPublicKey()', () => {
    it('should correctly fetch the root key', async () => {
        const derivationPath = "44'/1729'/0'/0'/0'";
        const result = await TezosHardwareWallet.unlockAddress(
            HardwareDeviceType.Trezor,
            derivationPath);
        console.log('hardware',result)
        expect(result.publicKey).to.be.a('string');
    });
});


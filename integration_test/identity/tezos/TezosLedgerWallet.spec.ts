import 'mocha';
import { expect } from 'chai';

import * as loglevel from 'loglevel';
import LogSelector from '../../../src/utils/LoggerSelector';
LogSelector.setLogger(loglevel.getLogger('conseiljs'));
LogSelector.setLevel('debug');

import { TezosLedgerWallet } from '../../../src/identity/tezos/TezosLedgerWallet';
import {HardwareDeviceType} from "../../../src/types/wallet/HardwareDeviceType";

describe('Ledger hardware signer integration tests', () => {
    it('unlockAddress', async () => {
        const derivationPath = "44'/1729'/0'/0'";
        const result = await TezosLedgerWallet.unlockAddress(HardwareDeviceType.LedgerNanoS, derivationPath);
        console.log(result);

        //expect(result['level']).to.be.greaterThan(52466, 'this may vary as the network changes');
        //expect(result['baker'].length).to.be.greaterThan(0)
    });
});

import 'mocha';
import {expect} from 'chai';
import * as trezorUtils from '../src/utils/TrezorUtils';
import {TezosHardwareWallet} from "../src/tezos/TezosHardwareWallet";
import {HardwareDeviceType} from "../src/types/HardwareDeviceType";
import {TezosOperations} from "../src";
import {servers} from "../test/servers";
import {KeyStore} from "../src/types/KeyStore";
import {TezosWallet} from "../src";

const derivationPath = `44'/1729'/0'/0'/0'`;
const tezosURL = servers.tezosServer;

const mochaAsync = (fn) => {
    return done => {
      fn.call().then(done, err => {
        done(err);
      });
    };
};


// describe('getTezosPublicKey()', () => {
//     it('should correctly fetch the root key', mochaAsync(async () => {
//         const result = await trezorUtils.getTezosPublicKey(derivationPath);
//         console.log('22222222result=', result);
//         expect(result.publicKey).to.be.a('string');
//     }));
// });

describe('signTezosOperation()', () => {
    it('should correctly sign an operation', mochaAsync(async () => {
        const ledgerKeys = await TezosHardwareWallet.unlockAddress(HardwareDeviceType.Trezor, derivationPath);
        const mnemonic = TezosWallet.generateMnemonic();
        const randomKeys = <KeyStore> TezosWallet.unlockIdentityWithMnemonic(mnemonic, '');
        const inactiveImplicitAddress = randomKeys.publicKeyHash;
        TezosOperations.setDeviceType(HardwareDeviceType.Trezor);
        const inactiveImplicitResult = await TezosOperations.sendTransactionOperation(
            tezosURL,
            ledgerKeys,
            inactiveImplicitAddress,
            1000000,
            300000, // Protocol 003 minimum fee for inactive implicit accounts is 1387
            derivationPath
        ).catch(err => {
            console.log('33333333333333', err);
            return {operationGroupID: ''}
        });

        console.log('11111111', inactiveImplicitResult);

        expect(inactiveImplicitResult.operationGroupID).to.exist;
    }));
});

// describe('signTezosOperation()', () => {
//     it('should correctly sign an operation', async () => {
//         const result = await ledgerUtils.signTezosOperation(
//             "44'/1729'/0'/0'/0'",
//             '0342397c7a82e1f7509513642e573020aeb0aea36ac087139085e42d480cd08520070000d2e495a7ab40156d0a7c35b73d2530a3470fc8700002000000cda3081bd81219ec494b29068dcfd19e427fed9a66abcdc9e9e99ca6478f60e9080000d2e495a7ab40156d0a7c35b73d2530a3470fc870d0860303c80100c0ba99060000e7670f32038107a59a2b9cfefae36ea21f5aa63c00');
//         console.log(result);
//         expect(result).to.be.a('Uint8Array')
//     });
// });



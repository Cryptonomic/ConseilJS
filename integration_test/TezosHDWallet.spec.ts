import 'mocha';
import {expect} from 'chai';
//import {TezosLedgerWallet} from '../src/tezos/TezosLedgerWallet';
import {HardwareDeviceType} from "../src/types/wallet/HardwareDeviceType";
const bip32 = require('bip32')
const bip39 = require('bip39')

describe('getTezosPublicKey()', () => {
    it('should correctly fetch the root key', async () => {
        const mnemonic = 'fresh legend begin cereal cactus kid reopen maple wild garbage deliver breeze true school unlock initial odor winner steak talk shoot crystal rack glare'
        const seed = bip39.mnemonicToSeed(mnemonic)
        const root = bip32.fromSeed(seed)
        const child = root.derivePath("m/44'/1729'/0'/0'/0'")
        //console.log(child)
    });
});

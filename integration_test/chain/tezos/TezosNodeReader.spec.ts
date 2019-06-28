import 'mocha';
import { expect } from 'chai';
import fetch from 'node-fetch';

import * as loglevel from 'loglevel';
import LogSelector from '../../../src/utils/LoggerSelector';
LogSelector.setLogger(loglevel.getLogger('conseiljs'));

import FetchSelector from '../../../src/utils/FetchSelector';
FetchSelector.setFetch(fetch);

import {TezosNodeReader} from '../../../src/chain/tezos/TezosNodeReader';
import {KeyStore, StoreType} from '../../../src/types/wallet/KeyStore';
import {servers} from '../../servers';

const keys: KeyStore = { // alphanet faucet account
    publicKey: 'edpkvMmmaxdUNWmxvnRUqbBfcdLLmANe4TUWucrE2GN75E4wMXUgJa',
    privateKey: 'edskRpjW6egVEyFwQAttuHy8S5WLYqkpichsW2MzDpAQHWvunrr4ZVWRRQ6dx5y4G9S2s8Y4MDevmpavPVVYDN6egrbypcbWAc',
    publicKeyHash: 'tz1aCy8b6Ls4Gz7m5SbANjtMPiH6dZr9nnS2',
    seed: '',
    storeType: StoreType.Mnemonic
};
const tezosURL = servers.tezosServer;

describe('TezosNodeReader integration test suite', () => {
    it('Invoke a contract with a string literal parameter', async () => {
        
    });
});

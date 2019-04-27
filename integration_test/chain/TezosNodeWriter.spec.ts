import 'mocha';
import { expect } from 'chai';
import fetch from 'node-fetch';

import FetchSelector from '../../src/utils/FetchSelector';
FetchSelector.setFetch(fetch);

import {TezosNodeWriter} from '../../src/chain/tezos/TezosNodeWriter';
import {KeyStore, StoreType} from '../../src/types/wallet/KeyStore';
import {servers} from '../servers';

const keys: KeyStore = {
    publicKey: 'edpkvMmmaxdUNWmxvnRUqbBfcdLLmANe4TUWucrE2GN75E4wMXUgJa',
    privateKey: 'edskRpjW6egVEyFwQAttuHy8S5WLYqkpichsW2MzDpAQHWvunrr4ZVWRRQ6dx5y4G9S2s8Y4MDevmpavPVVYDN6egrbypcbWAc',
    publicKeyHash: 'tz1aCy8b6Ls4Gz7m5SbANjtMPiH6dZr9nnS2',
    seed: '',
    storeType: StoreType.Mnemonic
};
const tezosURL = servers.tezosServer;

describe('TezosNodeWriter integration test suite', () => {
    it('Invoke a contract with parameters', async () => {
        const contractAddress = 'KT1XtauF2tnmAKBzbLA2gNoMji9zSzSyYq9w';
        const result = await TezosNodeWriter.sendContractInvocationOperation(tezosURL, keys, contractAddress, 10000, 1000, '', 1000, 100000, '{ "string": "Cryptonomicon" }');
        expect(result["operationGroupID"]).to.exist;
    });
});

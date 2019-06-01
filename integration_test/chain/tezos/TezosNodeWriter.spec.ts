import 'mocha';
import { expect } from 'chai';
import fetch from 'node-fetch';

import * as loglevel from 'loglevel';
import LogSelector from '../../../src/utils/LoggerSelector';
LogSelector.setLogger(loglevel.getLogger('conseiljs'));

import FetchSelector from '../../../src/utils/FetchSelector';
FetchSelector.setFetch(fetch);

import {TezosNodeWriter} from '../../../src/chain/tezos/TezosNodeWriter';
import {KeyStore, StoreType} from '../../../src/types/wallet/KeyStore';
import {servers} from '../../servers';

const keys: KeyStore = {
    publicKey: 'edpkvMmmaxdUNWmxvnRUqbBfcdLLmANe4TUWucrE2GN75E4wMXUgJa',
    privateKey: 'edskRpjW6egVEyFwQAttuHy8S5WLYqkpichsW2MzDpAQHWvunrr4ZVWRRQ6dx5y4G9S2s8Y4MDevmpavPVVYDN6egrbypcbWAc',
    publicKeyHash: 'tz1aCy8b6Ls4Gz7m5SbANjtMPiH6dZr9nnS2',
    seed: '',
    storeType: StoreType.Mnemonic
};
const tezosURL = servers.tezosServer;

describe('TezosNodeWriter integration test suite', () => {
    it('Invoke a contract with a string literal parameter', async () => {
        const contractAddress = 'KT1XtauF2tnmAKBzbLA2gNoMji9zSzSyYq9w';
        const result = await TezosNodeWriter.sendContractInvocationOperation(tezosURL, keys, contractAddress, 10000, 1000, '', 1000, 100000, '"Cryptonomicon"');
        expect(result["operationGroupID"]).to.exist;
    });

    it('Invoke a contract with a complex parameter', async () => {
        const contractAddress = 'KT1XtauF2tnmAKBzbLA2gNoMji9zSzSyYq9w';
        const result = await TezosNodeWriter.sendContractInvocationOperation(tezosURL, keys, contractAddress, 10000, 50000, '', 10000, 100000, '(Pair "message" (Pair "edsigtt7VBCeJjU9XtdCCPcV8VL3xe1XQHehk9Kg78Pxs3VZGXgHGGfktB71jUrK51tiJNybhUQidxxN48W4XWuRjjQwFJ17M1e" "edpkuqoemi1z8wjKxYCMvvshpFU7f71RUXhRyKudwLPBAdhqyj9epe"))');
        expect(result["operationGroupID"]).to.exist;
    });

    it('Originate a simple contract', async () => {
        const contract = `parameter string;
        storage string;
        code { CAR ; NIL operation ; PAIR }`;
        const storage = '"Test"';
        const result = await TezosNodeWriter.sendContractOriginationOperation(tezosURL, keys, 10000, undefined, false, false, 10000, '', '10000', '10000', contract, storage);
        expect(result["operationGroupID"]).to.exist;
    });
});

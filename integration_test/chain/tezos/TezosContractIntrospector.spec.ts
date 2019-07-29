import 'mocha';
import { expect } from 'chai';
import fetch from 'node-fetch';

import * as loglevel from 'loglevel';
import LogSelector from '../../../src/utils/LoggerSelector';
LogSelector.setLogger(loglevel.getLogger('conseiljs'));

import FetchSelector from '../../../src/utils/FetchSelector';
FetchSelector.setFetch(fetch);

import {TezosContractIntrospector} from '../../../src/chain/tezos/TezosContractIntrospector';
import {Entrypoint} from '../../../src/types/ContractIntrospectionTypes';
import {KeyStore, StoreType} from '../../../src/types/wallet/KeyStore';
import {servers} from '../../servers';

const keys: KeyStore = { // alphanet faucet account
    publicKey: 'edpkvMmmaxdUNWmxvnRUqbBfcdLLmANe4TUWucrE2GN75E4wMXUgJa',
    privateKey: 'edskRpjW6egVEyFwQAttuHy8S5WLYqkpichsW2MzDpAQHWvunrr4ZVWRRQ6dx5y4G9S2s8Y4MDevmpavPVVYDN6egrbypcbWAc',
    publicKeyHash: 'tz1aCy8b6Ls4Gz7m5SbANjtMPiH6dZr9nnS2',
    seed: '',
    storeType: StoreType.Mnemonic
};
const ConseilV2URL = servers.conseilServer;
const ConseilV2APIKey = servers.conseilApiKey;

describe('TezosNodeReader integration test suite', () => {
    it('Invoke a contract with a string literal parameter', async () => {
        let result = await TezosContractIntrospector.generateEntrypointsFromAddress({ url: ConseilV2URL, apiKey: ConseilV2APIKey }, 'alphanet', 'KT1JfYDaNGwxVZB36SqeydVdBCVh6EVu93bP');
        for (let entry of result) {
            console.log(entry);
            console.log();
        }
        expect(result[0]).to.equal()

        result = await TezosContractIntrospector.generateEntrypointsFromAddress({ url: ConseilV2URL, apiKey: ConseilV2APIKey }, 'alphanet', 'KT1XuBQ8FBEHSQU3jNQ8mwKpEado5djMdMtW');
        for (let entry of result) {
            console.log(entry);
            console.log();
        }
        
        //console.log(parserResult[0].generateParameter('food', 'drink', 'order'));
    });
});

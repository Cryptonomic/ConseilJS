import 'mocha';
import { expect } from 'chai';
import fetch from 'node-fetch';

import * as loglevel from 'loglevel';
import LogSelector from '../../../src/utils/LoggerSelector';
LogSelector.setLogger(loglevel.getLogger('conseiljs'));

import FetchSelector from '../../../src/utils/FetchSelector';
FetchSelector.setFetch(fetch);

import {TezosContractIntrospector} from '../../../src/chain/tezos/TezosContractIntrospector';
import {EntryPoint} from '../../../src/types/tezos/ContractIntrospectionTypes';
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

const conseilServer = {
    url: ConseilV2URL,
    apiKey: ConseilV2APIKey
}

describe('TezosContractIntrospector integration test suite', () => {
    it('Generate entry points for Tezos Baker Registry (Alphanet)', async () => {
        let result: EntryPoint[] = await TezosContractIntrospector.generateEntryPointsFromAddress(conseilServer, 'alphanet', 'KT1NpCh6tNQDmbmAVbGLxwRBx8jJD4rEFnmC');

        expect(result[0].name).to.equal('%_Liq_entry_updateName');
        expect(result[0].parameters.length).to.equal(1);
        expect(result[0].generateParameter('"param1"')).to.equal('(Left "param1")');

        expect(result[1].name).to.equal('%_Liq_entry_updatePaymentAddress');
        expect(result[1].parameters.length).to.equal(1);
        expect(result[1].generateParameter('"param1"')).to.equal('(Right (Left "param1"))');

        expect(result[2].name).to.equal('%_Liq_entry_updateTerms');
        expect(result[2].parameters.length).to.equal(3);
        expect(result[2].generateParameter(1, 2, 3)).to.equal('(Right (Right (Left (Pair 1 (Pair 2 3)))))');

        expect(result[3].name).to.equal('%_Liq_entry_deleteRegistration');
        expect(result[3].parameters.length).to.equal(1);
        expect(result[3].generateParameter('Unit')).to.equal('(Right (Right (Right Unit)))');
    });
});

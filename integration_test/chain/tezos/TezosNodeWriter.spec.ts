import 'mocha';
import { expect } from 'chai';
import fetch from 'node-fetch';

import * as loglevel from 'loglevel';
import LogSelector from '../../../src/utils/LoggerSelector';
LogSelector.setLogger(loglevel.getLogger('conseiljs'));
LogSelector.setLevel('debug');

import FetchSelector from '../../../src/utils/FetchSelector';
FetchSelector.setFetch(fetch);

import { TezosNodeWriter} from '../../../src/chain/tezos/TezosNodeWriter';
import { TezosConseilClient } from '../../../src/reporting/tezos/TezosConseilClient';
import * as TezosTypes from '../../../src/types/tezos/TezosChainTypes';
import { KeyStore, StoreType } from '../../../src/types/wallet/KeyStore';
import { ConseilServerInfo } from '../../../src/types/conseil/QueryTypes';
import { servers } from '../../servers';

const keys: KeyStore = { // alphanet faucet account
    publicKey: 'edpkvMmmaxdUNWmxvnRUqbBfcdLLmANe4TUWucrE2GN75E4wMXUgJa',
    privateKey: 'edskRpjW6egVEyFwQAttuHy8S5WLYqkpichsW2MzDpAQHWvunrr4ZVWRRQ6dx5y4G9S2s8Y4MDevmpavPVVYDN6egrbypcbWAc',
    publicKeyHash: 'tz1aCy8b6Ls4Gz7m5SbANjtMPiH6dZr9nnS2',
    seed: '',
    storeType: StoreType.Mnemonic
};
const tezosURL = servers.tezosServer;
const conseilServer: ConseilServerInfo = {url: servers.conseilServer, apiKey: servers.conseilApiKey };

describe('TezosNodeWriter integration test suite', () => {
    it('Invoke a contract with a string literal parameter', async () => {
        // TODO:
    });

    it('Invoke a contract with a string literal Michelson parameter', async () => {
        const contractAddress = 'KT1XtauF2tnmAKBzbLA2gNoMji9zSzSyYq9w';
        const result = await TezosNodeWriter.sendContractInvocationOperation(tezosURL, keys, contractAddress, 10000, 1000, '', 1000, 100000, '"Cryptonomicon"', TezosTypes.TezosParameterFormat.Michelson);
        expect(result["operationGroupID"]).to.exist;
    });

    it('Invoke a contract with a complex Michelson parameter', async () => {
        const contractAddress = 'KT1XtauF2tnmAKBzbLA2gNoMji9zSzSyYq9w';
        const result = await TezosNodeWriter.sendContractInvocationOperation(tezosURL, keys, contractAddress, 10000, 50000, '', 10000, 100000, '(Pair "message" (Pair "edsigtt7VBCeJjU9XtdCCPcV8VL3xe1XQHehk9Kg78Pxs3VZGXgHGGfktB71jUrK51tiJNybhUQidxxN48W4XWuRjjQwFJ17M1e" "edpkuqoemi1z8wjKxYCMvvshpFU7f71RUXhRyKudwLPBAdhqyj9epe"))', TezosTypes.TezosParameterFormat.Michelson);
        expect(result["operationGroupID"]).to.exist;
    });

    it('Originate a simple contract in Michelson', async () => {
        const contract = `parameter string;
        storage string;
        code { CAR ; NIL operation ; PAIR }`;
        const storage = '"Test"';
        const result = await TezosNodeWriter.sendContractOriginationOperation(tezosURL, keys, 10000, undefined, false, false, 10000, '', 10000, 10000, contract, storage, TezosTypes.TezosParameterFormat.Michelson);
        expect(result["operationGroupID"]).to.exist;
    });

    it('Originate a simple contract in Micheline', async () => {
        const contract = `[ { "prim": "parameter", "args": [ { "prim": "string" } ] },
        { "prim": "storage", "args": [ { "prim": "string" } ] },
        { "prim": "code",
          "args":
            [ [ { "prim": "CAR" },
                { "prim": "NIL",
                  "args": [ { "prim": "operation" } ] },
                { "prim": "PAIR" } ] ] } ]`;
        const storage = '{ "string": "hello" }';
        const result = await TezosNodeWriter.sendContractOriginationOperation(tezosURL, keys, 10000, undefined, false, false, 10000, '', 10000, 10000, contract, storage, TezosTypes.TezosParameterFormat.Micheline);
        expect(result["operationGroupID"]).to.exist;
    });

    it('Delegate 10xtz', async () => {
        const nodeResult = await TezosNodeWriter.sendAccountOriginationOperation(tezosURL, keys, 100000000, 'tz1YCABRTa6H8PLKx2EtDWeCGPaKxUhNgv47', true, true, 10000, '');
        expect(nodeResult['operationGroupID']).to.exist;

        const groupid = nodeResult["operationGroupID"].replace(/\"/g, '').replace(/\n/, '');
        const conseilResult = await TezosConseilClient.awaitOperationConfirmation(conseilServer, servers.conseilNetwork, groupid, 10);
        expect(conseilResult[0].delegate).to.eq('tz1YCABRTa6H8PLKx2EtDWeCGPaKxUhNgv47');
    });

    it('Re-delegate', async () => {
        const result = await TezosNodeWriter.sendDelegationOperation(tezosURL, keys, 'KT1RniiDrmLUfTHX2JMhLJv3LDTMca1xcF2M', 'tz3WXYtyDUNL91qfiCJtVUX746QpNv5i5ve5', 10000, '');
        expect(result["operationGroupID"]).to.exist;
    });
});

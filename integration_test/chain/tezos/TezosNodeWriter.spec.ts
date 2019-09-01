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
import { TezosNodeReader } from '../../../src/chain/tezos/TezosNodeReader';
import { TezosLanguageUtil } from '../../../src/chain/tezos/TezosLanguageUtil';
import { TezosWalletUtil} from '../../../src/identity/tezos/TezosWalletUtil';
import { TezosConseilClient } from '../../../src/reporting/tezos/TezosConseilClient';
import * as TezosTypes from '../../../src/types/tezos/TezosChainTypes';
import * as TezosP2PMessageTypes from '../../../src/types/tezos/TezosP2PMessageTypes';
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
        const destinationAddress = 'tz1VttGDs9M2kr3zMfLRHqACpAcNcKY2bYj5';
        const result = await TezosNodeWriter.sendTransactionOperation(tezosURL, keys, destinationAddress, 17276902, 20000);
        expect(result["operationGroupID"]).to.exist;
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

    it('Send a batch of transactions', async () => {
        const destinationA = (await TezosWalletUtil.restoreIdentityWithSecretKey('edskRfEbB2JJCffvCFSVCYvKhz2bdp97esBsuUuNLQYZkZu9gFRU3GbcGBs8zRyoJVYh1pkyWRZfHbASuWzrPLDx9tnRwCeUqZ')).publicKeyHash;
        const destinationB = (await TezosWalletUtil.restoreIdentityWithSecretKey('edskRtkDq2Z2Z9jMfYjiBvwqky6E7xK8uXxBVnSTdUTALeyqckSdkaSnLSCpx4HCNBBMoLcLo9254tYvBVeoPzfb92xWSHhTSb')).publicKeyHash;

        let operations = [
            { destination: destinationA, amount: '100000', storage_limit: '300', gas_limit: '10600', counter: '0', fee: '10000', source: keys.publicKeyHash, kind: 'transaction' },
            { destination: destinationB, amount: '100000', storage_limit: '300', gas_limit: '10600', counter: '0', fee: '10000', source: keys.publicKeyHash, kind: 'transaction' }
        ];
        TezosNodeWriter.queueOperation(tezosURL, operations, keys);

        operations = [
            { destination: destinationA, amount: '100000', storage_limit: '300', gas_limit: '10600', counter: '0', fee: '10000', source: keys.publicKeyHash, kind: 'transaction' },
        ];
        TezosNodeWriter.queueOperation(tezosURL, operations, keys);

        await new Promise(resolve => setTimeout(resolve, 40 * 1000));

        expect(TezosNodeWriter.getQueueStatus(tezosURL, keys)).to.equal(0);
    });

    it('Estimate transaction gas cost', async () => {
        const counter = await TezosNodeReader.getCounterForAccount(tezosURL, keys.publicKeyHash) + 1;

        const transaction: TezosP2PMessageTypes.Transaction = {
            destination: 'KT1XtauF2tnmAKBzbLA2gNoMji9zSzSyYq9w',
            amount: '0',
            storage_limit: '100',
            gas_limit: '20000',
            counter: counter.toString(),
            fee: '50000',
            source: keys.publicKeyHash,
            kind: 'transaction',
            parameters: JSON.parse(TezosLanguageUtil.translateMichelsonToMicheline('"Cryptonomicon-Cryptonomicon-Cryptonomicon"'))
        };

        const result = await TezosNodeWriter.testOperation(tezosURL, [transaction], keys);

        expect(result.length).to.equal(2);
        expect(result[0]).to.be.greaterThan(10000);
        expect(result[1]).to.be.greaterThan(-1);
    });
});

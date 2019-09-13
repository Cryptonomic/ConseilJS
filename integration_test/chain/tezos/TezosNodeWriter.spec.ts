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
import { tezosServer, conseilServer, faucetAccount, keys, transferAddress, bakerAddress, contractAddress } from '../../TestAssets.zeronet';

describe('TezosNodeWriter integration test suite', () => {
    it('Activate faucet account', async () => {
        const faucetKeys = await TezosWalletUtil.unlockFundraiserIdentity(faucetAccount.mnemonic.join(' '), faucetAccount.email, faucetAccount.password, faucetAccount.pkh);
        const nodeResult = await TezosNodeWriter.sendIdentityActivationOperation(tezosServer, faucetKeys, faucetAccount.secret);
        expect(nodeResult["operationGroupID"]).to.exist;
    });

    it('Reveal faucet account', async () => {
        const nodeResult = await TezosNodeWriter.sendKeyRevealOperation(tezosServer, keys, 50000);
        expect(nodeResult["operationGroupID"]).to.exist;
    });

    it('Send XTZ to an account', async () => {
        const nodeResult = await TezosNodeWriter.sendTransactionOperation(tezosServer, keys, transferAddress, 500123, 20000);
        expect(nodeResult["operationGroupID"]).to.exist;

        const groupid = nodeResult["operationGroupID"].replace(/\"/g, '').replace(/\n/, '');
        await TezosConseilClient.awaitOperationConfirmation(conseilServer, conseilServer.network, groupid, 5, 31);
    });

    it('Set implicit account delegate', async () => {
        const nodeResult = await TezosNodeWriter.sendDelegationOperation(tezosServer, keys, keys.publicKeyHash, bakerAddress, 10000);
        expect(nodeResult["operationGroupID"]).to.exist;

        const groupid = nodeResult["operationGroupID"].replace(/\"/g, '').replace(/\n/, '');
        await TezosConseilClient.awaitOperationConfirmation(conseilServer, conseilServer.network, groupid, 5, 31);
    });

    it('Originate a simple contract in Michelson', async () => {
        const contract = `parameter string;
        storage string;
        code { CAR ; NIL operation ; PAIR }`;
        const storage = '"Test"';
        const nodeResult = await TezosNodeWriter.sendContractOriginationOperation(tezosServer, keys, 10000, undefined, 10000, '', 10000, 20000, contract, storage, TezosTypes.TezosParameterFormat.Michelson);
        expect(nodeResult["operationGroupID"]).to.exist;

        const groupid = nodeResult["operationGroupID"].replace(/\"/g, '').replace(/\n/, '');
        await TezosConseilClient.awaitOperationConfirmation(conseilServer, conseilServer.network, groupid, 5, 30);
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
        const nodeResult = await TezosNodeWriter.sendContractOriginationOperation(tezosServer, keys, 10000, undefined, 10000, '', 10000, 20000, contract, storage, TezosTypes.TezosParameterFormat.Micheline);
        expect(nodeResult["operationGroupID"]).to.exist;

        const groupid = nodeResult["operationGroupID"].replace(/\"/g, '').replace(/\n/, '');
        await TezosConseilClient.awaitOperationConfirmation(conseilServer, conseilServer.network, groupid, 5, 31);
    });

    it('Invoke a contract with a string literal Michelson parameter, default entry point', async () => {
        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(tezosServer, keys, contractAddress, 10000, 10000, '', 1000, 100000, 'default', '"Cryptonomicon"', TezosTypes.TezosParameterFormat.Michelson);
        expect(nodeResult["operationGroupID"]).to.exist;

        const groupid = nodeResult["operationGroupID"].replace(/\"/g, '').replace(/\n/, '');
        await TezosConseilClient.awaitOperationConfirmation(conseilServer, conseilServer.network, groupid, 5, 31);
    });

    /*it('Invoke a contract with a complex Michelson parameter', async () => {
        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(tezosServer, keys, contractAddress, 10000, 20000, '', 10000, 100000, '', '(Pair "message" (Pair "edsigtt7VBCeJjU9XtdCCPcV8VL3xe1XQHehk9Kg78Pxs3VZGXgHGGfktB71jUrK51tiJNybhUQidxxN48W4XWuRjjQwFJ17M1e" "edpkuqoemi1z8wjKxYCMvvshpFU7f71RUXhRyKudwLPBAdhqyj9epe"))', TezosTypes.TezosParameterFormat.Michelson);
        expect(nodeResult["operationGroupID"]).to.exist;

        const groupid = nodeResult["operationGroupID"].replace(/\"/g, '').replace(/\n/, '');
        await TezosConseilClient.awaitOperationConfirmation(conseilServer, conseilServer.network, groupid, 5, 31);
    });*/

    it('Estimate transaction gas cost', async () => {
        const counter = await TezosNodeReader.getCounterForAccount(tezosServer, keys.publicKeyHash) + 1;

        const transaction: TezosP2PMessageTypes.Transaction = {
            destination: contractAddress,
            amount: '0',
            storage_limit: '100',
            gas_limit: '20000',
            counter: counter.toString(),
            fee: '50000',
            source: keys.publicKeyHash,
            kind: 'transaction',
            parameters: {
                entrypoint: '',
                value: JSON.parse(TezosLanguageUtil.translateMichelsonToMicheline('"Cryptonomicon-Cryptonomicon-Cryptonomicon"'))
            }
        };

        const result = await TezosNodeWriter.testOperation(tezosServer, [transaction], keys);

        expect(result.length).to.equal(2);
        expect(result[0]).to.be.greaterThan(10000);
        expect(result[1]).to.be.greaterThan(-1);
    });

    /*it('Send a batch of transactions', async () => {
        const destinationA = (await TezosWalletUtil.restoreIdentityWithSecretKey('edskRfEbB2JJCffvCFSVCYvKhz2bdp97esBsuUuNLQYZkZu9gFRU3GbcGBs8zRyoJVYh1pkyWRZfHbASuWzrPLDx9tnRwCeUqZ')).publicKeyHash;
        const destinationB = (await TezosWalletUtil.restoreIdentityWithSecretKey('edskRtkDq2Z2Z9jMfYjiBvwqky6E7xK8uXxBVnSTdUTALeyqckSdkaSnLSCpx4HCNBBMoLcLo9254tYvBVeoPzfb92xWSHhTSb')).publicKeyHash;

        let operations = [
            { destination: destinationA, amount: '100000', storage_limit: '300', gas_limit: '10600', counter: '0', fee: '10000', source: keys.publicKeyHash, kind: 'transaction' },
            { destination: destinationB, amount: '100000', storage_limit: '300', gas_limit: '10600', counter: '0', fee: '10000', source: keys.publicKeyHash, kind: 'transaction' }
        ];
        TezosNodeWriter.queueOperation(tezosServer, operations, keys);

        operations = [
            { destination: destinationA, amount: '100000', storage_limit: '300', gas_limit: '10600', counter: '0', fee: '10000', source: keys.publicKeyHash, kind: 'transaction' },
        ];
        TezosNodeWriter.queueOperation(tezosServer, operations, keys);

        await new Promise(resolve => setTimeout(resolve, 40 * 1000));

        expect(TezosNodeWriter.getQueueStatus(tezosServer, keys)).to.equal(0);
    });*/
});

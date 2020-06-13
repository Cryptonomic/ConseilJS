import { expect, use } from "chai";
import chaiAsPromised from 'chai-as-promised';
import nock from 'nock';
import fetch from 'node-fetch';
import * as log from 'loglevel';

import { registerFetch, registerLogger } from '../../../src/index';
import { KeyStoreUtils, SoftSigner } from '../../../../ConseilJS-softsigner';

import mochaAsync from '../../mochaTestHelper';
import { accounts } from "../../_staticData/accounts.json";
import * as responses from "../../_staticData/TezosResponses.json";

import { TezosNodeWriter } from "../../../src/chain/tezos/TezosNodeWriter";
import { TezosMessageUtils } from "../../../src/chain/tezos/TezosMessageUtil";
import { KeyStore, Signer } from "../../../src/types/ExternalInterfaces";

use(chaiAsPromised);

describe('TezosNodeWriter tests', () => {
    const serverUrl = 'https://tezos.node';
    const server = nock(serverUrl);
    let signer: Signer;
    let keyStore: KeyStore;

    before(mochaAsync(async () => {
        const logger = log.getLogger('conseiljs');
        logger.setLevel('error', false);
        registerLogger(logger);
        registerFetch(fetch);

        keyStore = await KeyStoreUtils.restoreIdentityFromSecretKey(accounts[0].secretKey);
        signer = new SoftSigner(TezosMessageUtils.writeKeyWithHint(keyStore.secretKey, 'edsk'));

        server.persist().get(`/chains/main/blocks/head`)
            .reply(200, responses['blocks/head']);
        server.persist().get(`/chains/main/blocks/head/context/contracts/${accounts[0].publicKeyHash}/counter`)
            .reply(200, responses['chains/main/blocks/head/context/contracts/tz1QSHaKpTFhgHLbqinyYRjxD5sLcbfbzhxy/counter']);
        server.persist().get(`/chains/main/blocks/head/context/contracts/${accounts[0].publicKeyHash}/manager_key`)
            .reply(200, responses['chains/main/blocks/head/context/contracts/tz1QSHaKpTFhgHLbqinyYRjxD5sLcbfbzhxy/manager_key']);
    }));

    it('forgeOperationsRemotely test', mochaAsync(async () => {
        server.filteringRequestBody(body => '*')
            .post(`/chains/main/blocks/head/helpers/forge/operations`)
            .reply(200, responses['tz1QSHaKpTFhgHLbqinyYRjxD5sLcbfbzhxy-forgeOperationsRemotely-success'])

        const transaction = {
            kind: 'transaction',
            source: accounts[0].publicKeyHash,
            fee: '1490',
            counter: '1000',
            gas_limit: '10000',
            storage_limit: '300',
            amount: '1000',
            destination: accounts[1].publicKeyHash,
        }

        const sendResult = await TezosNodeWriter.forgeOperationsRemotely(serverUrl, responses['blocks/head'].hash, [transaction]);
        expect(sendResult).to.exist;
        expect(sendResult).to.be.a('string');
    }));

    it('sendOperation test', mochaAsync(async () => { }));

    it('queueOperation test', mochaAsync(async () => { }));

    it('getQueueStatus test', mochaAsync(async () => { }));

    it('appendRevealOperation test', mochaAsync(async () => { }));

    it('sendTransactionOperation test', mochaAsync(async () => {
        server.filteringRequestBody(body => '*')
            .post(`/chains/main/blocks/head/helpers/preapply/operations`)
            .reply(200, responses['tz1QSHaKpTFhgHLbqinyYRjxD5sLcbfbzhxy-sendTransactionOperation-preapply-success'])
            .post(`/injection/operation?chain=main`)
            .reply(200, responses['tz1QSHaKpTFhgHLbqinyYRjxD5sLcbfbzhxy-sendTransactionOperation-injection-success']);

        const destination = 'tz1fX6A2miVXjNyReg2dpt2TsXLkZ4w7zRGa';
        const amount = 1_000;
        const fee = 100_000;

        const sendResult = await TezosNodeWriter.sendTransactionOperation(serverUrl, signer, keyStore, destination, amount, fee);

        expect(sendResult).to.exist;
        expect(sendResult.operationGroupID).to.equal('"onjsJjd5jK6yA3V3g4bQ1UVdeLzBePaVmNybG4yzhePeXyFhPLB"');
    }));

    it('sendDelegationOperation test', mochaAsync(async () => { }));

    it('sendUndelegationOperation test', mochaAsync(async () => { }));

    it('sendContractOriginationOperation test', mochaAsync(async () => { }));

    it('sendContractInvocationOperation test', mochaAsync(async () => { }));

    it('sendContractPing test', mochaAsync(async () => { }));

    it('sendKeyRevealOperation test', mochaAsync(async () => { }));

    it('sendIdentityActivationOperation test', mochaAsync(async () => { }));

    it('testContractInvocationOperation test', mochaAsync(async () => { }));

    it('testContractDeployOperation test', mochaAsync(async () => { }));
});

import { expect, use } from "chai";
import chaiAsPromised from 'chai-as-promised';
import nock from 'nock';
import fetch from 'node-fetch';
import * as log from 'loglevel';

import { registerFetch, registerLogger } from '../../../src/index';
import { KeyStoreUtils, SoftSigner } from 'conseiljs-softsigner';

import mochaAsync from '../../mochaTestHelper';
import { accounts, contracts, drips } from "../../_staticData/accounts.json";
import * as responses from "../../_staticData/TezosResponses.json";

import { TezosNodeWriter } from "../../../src/chain/tezos/TezosNodeWriter";
import { TezosMessageUtils } from "../../../src/chain/tezos/TezosMessageUtil";
import { KeyStore, Signer } from "../../../src/types/ExternalInterfaces";

use(chaiAsPromised);

describe('TezosNodeWriter tests', () => {
    const serverUrl = 'https://tezos.node';

    let keyStore: KeyStore;
    let signer: Signer;
    let faucetKeyStore: KeyStore;
    let faucetSigner: Signer;

    before(mochaAsync(async () => {
        const logger = log.getLogger('conseiljs');
        logger.setLevel('error', false);
        registerLogger(logger);
        registerFetch(fetch);

        keyStore = await KeyStoreUtils.restoreIdentityFromSecretKey(accounts[0].secretKey);
        signer = await SoftSigner.createSigner(TezosMessageUtils.writeKeyWithHint(keyStore.secretKey, 'edsk'));

        faucetKeyStore = await KeyStoreUtils.restoreIdentityFromFundraiser(drips[0].mnemonic.join(' '), drips[0].email, drips[0].password, drips[0].pkh);
        faucetSigner = await SoftSigner.createSigner(TezosMessageUtils.writeKeyWithHint(faucetKeyStore.secretKey, 'edsk'));
    }));

    it('forgeOperationsRemotely test', mochaAsync(async () => {
        const server = nock(serverUrl);
        server
            .filteringRequestBody(body => '*')
            .post(`/chains/main/blocks/head/helpers/forge/operations`)
                .reply(200, responses[`${accounts[0].publicKeyHash}-forgeOperationsRemotely-success`])

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

        const sendResult = await TezosNodeWriter.forgeOperationsRemotely(serverUrl, responses['sendTransactionOperation-blocks/head'].hash, [transaction]);
        expect(sendResult).to.exist;
        expect(sendResult).to.be.a('string');
    }));

    it('sendOperation test', mochaAsync(async () => { }));

    it('queueOperation test', mochaAsync(async () => { }));

    it('getQueueStatus test', mochaAsync(async () => { }));

    it('appendRevealOperation test', mochaAsync(async () => { }));

    it('sendTransactionOperation test', mochaAsync(async () => {
        const server = nock(serverUrl);
        server
            .get(`/chains/main/blocks/head`)
                .reply(200, responses['sendTransactionOperation-blocks/head']);
        server
            .get(`/chains/main/blocks/head/context/contracts/${accounts[0].publicKeyHash}/counter`)
                .reply(200, responses[`chains/main/blocks/head/context/contracts/${accounts[0].publicKeyHash}/counter`])
            .get(`/chains/main/blocks/head/context/contracts/${accounts[0].publicKeyHash}/manager_key`)
                .reply(200, responses[`chains/main/blocks/head/context/contracts/${accounts[0].publicKeyHash}/manager_key`])
            .filteringRequestBody(body => '*')
            .post(`/chains/main/blocks/head/helpers/preapply/operations`)
                .reply(200, responses[`${keyStore.publicKeyHash}-sendTransactionOperation-preapply-success`])
            .post(`/injection/operation?chain=main`)
                .reply(200, responses[`${keyStore.publicKeyHash}-sendTransactionOperation-injection-success`]);

        const destination = 'tz1fX6A2miVXjNyReg2dpt2TsXLkZ4w7zRGa';
        const amount = 1_000;
        const fee = 100_000;

        const sendResult = await TezosNodeWriter.sendTransactionOperation(serverUrl, signer, keyStore, destination, amount, fee);

        expect(sendResult).to.exist;
        expect(sendResult.operationGroupID).to.equal('"onjsJjd5jK6yA3V3g4bQ1UVdeLzBePaVmNybG4yzhePeXyFhPLB"');
    }));

    it('sendTransactionOperation test with Reveal', mochaAsync(async () => {
        const server = nock(serverUrl);
        server
            .get(`/chains/main/blocks/head`)
                .reply(200, responses['sendIdentityActivationOperation-blocks/head'])
            .get(`/chains/main/blocks/head/context/contracts/${faucetKeyStore.publicKeyHash}/counter`)
                .reply(200, responses[`chains/main/blocks/head/context/contracts/${faucetKeyStore.publicKeyHash}/counter`])
            .get(`/chains/main/blocks/head/context/contracts/${faucetKeyStore.publicKeyHash}/manager_key`)
                .reply(200, responses[`chains/main/blocks/head/context/contracts/${faucetKeyStore.publicKeyHash}/manager_key`])
            .filteringRequestBody(body => '*')
            .post(`/chains/main/blocks/head/helpers/preapply/operations`)
                .reply(200, responses[`${faucetKeyStore.publicKeyHash}-sendTransactionOperation-preapply-success`])
            .post(`/injection/operation?chain=main`)
                .reply(200, responses[`${faucetKeyStore.publicKeyHash}-sendTransactionOperation-injection-success`]);

        const destination = accounts[0].publicKeyHash;
        const amount = 1_000;
        const fee = 100_000;

        const sendResult = await TezosNodeWriter.sendTransactionOperation(serverUrl, faucetSigner, faucetKeyStore, destination, amount, fee);

        expect(sendResult).to.exist;
        expect(sendResult.operationGroupID).to.equal('"onot1enXXuvjebJSnp1zAfvpAefmaHidw7U6FEDvUXrP63w6QBc"');
    }));

    it('sendDelegationOperation test', mochaAsync(async () => { }));

    it('sendUndelegationOperation test', mochaAsync(async () => { }));

    it('sendContractOriginationOperation test', mochaAsync(async () => { }));

    it('sendContractInvocationOperation test', mochaAsync(async () => { }));

    it('sendContractPing test', mochaAsync(async () => { }));

    it('sendKeyRevealOperation test', mochaAsync(async () => { }));

    it('sendIdentityActivationOperation test', mochaAsync(async () => {
        const server = nock(serverUrl);
        server
            .get(`/chains/main/blocks/head`)
                .reply(200, responses['sendIdentityActivationOperation-blocks/head'])
            .filteringRequestBody(body => '*')
            .post(`/chains/main/blocks/head/helpers/preapply/operations`)
                .reply(200, responses[`${faucetKeyStore.publicKeyHash}-sendIdentityActivationOperation-preapply-success`])
            .post(`/injection/operation?chain=main`)
                .reply(200, responses[`${faucetKeyStore.publicKeyHash}-sendIdentityActivationOperation-injection-success`]);
                

        const sendResult = await TezosNodeWriter.sendIdentityActivationOperation(serverUrl, faucetSigner, faucetKeyStore, drips[0].secret);

        expect(sendResult).to.exist;
        expect(sendResult.operationGroupID).to.equal('"ooZ5Yc4bzUK76eXh4h5SBAMtMTBXhrHwVQe6McwfJsfrtXbnsPr"');
    }));

    it('testContractInvocationOperation test', mochaAsync(async () => { }));

    it('testContractDeployOperation test', mochaAsync(async () => { }));

    it('estimateOperation test', mochaAsync(async () => { }));
});

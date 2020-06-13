import { expect, use } from "chai";
import chaiAsPromised from 'chai-as-promised';
import nock from 'nock';
import fetch from 'node-fetch';
import * as log from 'loglevel';

import { registerFetch, registerLogger } from '../../../src/index';

import mochaAsync from '../../mochaTestHelper';
import { accounts, contracts, drips } from "../../_staticData/accounts.json";
import * as responses from "../../_staticData/TezosResponses.json";

import { TezosNodeReader } from "../../../src/chain/tezos/TezosNodeReader";
import { TezosMessageUtils } from "../../../src/chain/tezos/TezosMessageUtil";

use(chaiAsPromised);

describe('TezosNodeWriter tests', () => {
    const serverUrl = 'https://tezos.node';

    before(mochaAsync(async () => {
        const logger = log.getLogger('conseiljs');
        logger.setLevel('error', false);
        registerLogger(logger);
        registerFetch(fetch);
    }));

    it('getBlockHead test', mochaAsync(async () => { }));

    it('getAccountForBlock test', mochaAsync(async () => {
        const server = nock(serverUrl);
        server
            .get(`/chains/main/blocks/head/context/contracts/tz1TEZtYnuLiZLdA6c7JysAUJcHMrogu4Cpr`)
                .reply(200, responses['chains/main/blocks/head/context/contracts/tz1TEZtYnuLiZLdA6c7JysAUJcHMrogu4Cpr']);

        const result = await TezosNodeReader.getAccountForBlock(serverUrl, 'head', 'tz1TEZtYnuLiZLdA6c7JysAUJcHMrogu4Cpr');

        expect(result).to.exist;
    }));

    it('getCounterForAccount test', mochaAsync(async () => {
        const server = nock(serverUrl);
        server
            .get(`/chains/main/blocks/head/context/contracts/tz1TEZtYnuLiZLdA6c7JysAUJcHMrogu4Cpr/counter`)
                .reply(200, responses['chains/main/blocks/head/context/contracts/tz1TEZtYnuLiZLdA6c7JysAUJcHMrogu4Cpr/counter']);

        const result = await TezosNodeReader.getCounterForAccount(serverUrl, 'tz1TEZtYnuLiZLdA6c7JysAUJcHMrogu4Cpr');

        expect(result).to.exist;
    }));

    it('getSpendableBalanceForAccount test', mochaAsync(async () => {
        const server = nock(serverUrl);
        server
            .get(`/chains/main/blocks/head/context/contracts/tz1TEZtYnuLiZLdA6c7JysAUJcHMrogu4Cpr`)
                .reply(200, responses['chains/main/blocks/head/context/contracts/tz1TEZtYnuLiZLdA6c7JysAUJcHMrogu4Cpr']);

        const result = await TezosNodeReader.getSpendableBalanceForAccount(serverUrl, 'tz1TEZtYnuLiZLdA6c7JysAUJcHMrogu4Cpr');

        expect(result).to.exist;
    }));

    it('isImplicitAndEmpty test', mochaAsync(async () => {
        const server = nock(serverUrl);
        server
            .get(`/chains/main/blocks/head/context/contracts/tz1TEZtYnuLiZLdA6c7JysAUJcHMrogu4Cpr`)
                .reply(200, responses['chains/main/blocks/head/context/contracts/tz1TEZtYnuLiZLdA6c7JysAUJcHMrogu4Cpr']);

        const result = await TezosNodeReader.isImplicitAndEmpty(serverUrl, 'tz1TEZtYnuLiZLdA6c7JysAUJcHMrogu4Cpr');

        expect(result).to.exist;
    }));

    it('isManagerKeyRevealedForAccount test', mochaAsync(async () => { }));

    it('getContractStorage test', mochaAsync(async () => { }));

    it('getValueForBigMapKey test', mochaAsync(async () => { }));

    it('getMempoolOperation test', mochaAsync(async () => {
        const server = nock(serverUrl);
        server
            .get(`/chains/main/mempool/pending_operations`)
                .reply(200, responses['chains/main/mempool/pending_operations']);

        const result = await TezosNodeReader.getMempoolOperation(serverUrl, 'oozwdudtgAnfUg33dHzsAEAEjW6T4fZrPXxGCr6MLqkhuuHeVpd');

        expect(result).to.exist;
    }));

    it('getMempoolOperation failure test', mochaAsync(async () => {
        const server = nock(serverUrl);
        server
            .get(`/chains/main/mempool/pending_operations`)
                .reply(200, responses['chains/main/mempool/pending_operations']);

        const result = await TezosNodeReader.getMempoolOperation(serverUrl, 'ooTfnFEAfLjK46MJASjHymVitqxtgpxqJPEW2pr6t3jhkEYCNVi');

        expect(result).to.not.exist;
    }));

    it('estimateBranchTimeout test', mochaAsync(async () => { }));

    it('getMempoolOperationsForAccount test', mochaAsync(async () => { }));
});
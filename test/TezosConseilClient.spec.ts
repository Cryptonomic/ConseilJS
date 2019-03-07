import "mocha";
import { expect, use} from "chai";
import chaiAsPromised from 'chai-as-promised';
import nock from 'nock';

import fetch from 'node-fetch';
import FetchSelector from '../src/utils/FetchSelector';
FetchSelector.setFetch(fetch);

import {TezosConseilClient} from '../src/reporting/tezos/TezosConseilClient';
import {ConseilQueryBuilder} from '../src/reporting/ConseilQueryBuilder';
import {ConseilOperator, ConseilSortDirection} from "../src/types/conseil/QueryTypes"
import {OperationKindType} from "../src/types/tezos/TezosChainTypes";

import mochaAsync from '../test/mochaTestHelper';

import {
    blockHead, block, accounts, operationgroups, operationgroup, blocks, account, operations, transactionfees, badJSON
} from './TezosConseilClient.responses';

use(chaiAsPromised);

describe('TezosConseilClient tests', () => {
    it('TezosConseilClient.getBlockHead', mochaAsync(async () => {
        const nockedserver = nock('http://conseil.server');
        nockedserver.post('/v2/data/tezos/alphanet/blocks').reply(200, blockHead);

        const result = await TezosConseilClient.getBlockHead({ url: 'http://conseil.server', apiKey: 'c0ffee' }, 'alphanet');

        expect(result.length).to.equal(1);
        expect(result[0]['level']).to.equal(173066);
    }));

    it('TezosConseilClient.getBlock', mochaAsync(async () => {
        const nockedserver = nock('http://conseil.server');
        nockedserver.post('/v2/data/tezos/alphanet/blocks').reply(200, block);

        const result = await TezosConseilClient.getBlock({ url: 'http://conseil.server', apiKey: 'c0ffee' }, 'alphanet', 'BL5zoNBN17j2AcUrs8mqSKSMcEiuBKkd9RB6uZ6CgYE2Xyb2ybV');

        expect(result.length).to.equal(1);
        expect(result[0]['predecessor']).to.equal('BLyxiXprmaDkCeZo3b9JHU4udjPiVUpuTR1eKXSxtJe9o8JMbiM');
    }));

    it('TezosConseilClient.getAccount', mochaAsync(async () => {
        const nockedserver = nock('http://conseil.server');
        nockedserver.post('/v2/data/tezos/alphanet/accounts').reply(200, account);

        const result = await TezosConseilClient.getAccount({ url: 'http://conseil.server', apiKey: 'c0ffee' }, 'alphanet', 'tz1L8MjMxQJio8YmmfdFbbVSymbNx5uiX3XT');

        expect(result.length).to.equal(1);
        expect(result[0]['manager']).to.equal('tz1L8MjMxQJio8YmmfdFbbVSymbNx5uiX3XT');
    }));

    it('TezosConseilClient.getOperationGroup', mochaAsync(async () => {
        const nockedserver = nock('http://conseil.server');
        nockedserver.post('/v2/data/tezos/alphanet/operation_groups').reply(200, operationgroup);

        const result = await TezosConseilClient.getOperationGroup({ url: 'http://conseil.server', apiKey: 'c0ffee' }, 'alphanet', 'ooYPxHKwUgkXxbWVfZFuYnvjNuGtrAgRQEtNrbPXNiwTBbCFW9j');

        expect(result.length).to.equal(1);
        expect(result[0]['branch']).to.equal('BLA3ecN7jh6Vc7XmogePRsdAjjbueG9NHsb32ByL5nbAhMvcNxK');
    }));

    it('TezosConseilClient.getBlocks', mochaAsync(async () => {
        const nockedserver = nock('http://conseil.server');
        nockedserver.post('/v2/data/tezos/alphanet/blocks').reply(200, blocks);

        const query = ConseilQueryBuilder.setLimit(ConseilQueryBuilder.blankQuery(), 3);
        const result = await TezosConseilClient.getBlocks({ url: 'http://conseil.server', apiKey: 'c0ffee' }, 'alphanet', query);

        expect(result.length).to.equal(3);
        expect(result[1]['predecessor']).to.equal('BLqVwN6edWdVjER62uoF9N3KcMXZc4or3j2NetsHQnzNJCUwBbR');
    }));

    it('TezosConseilClient.getAccounts', mochaAsync(async () => {
        const nockedserver = nock('http://conseil.server');
        nockedserver.post('/v2/data/tezos/alphanet/accounts').reply(200, accounts);

        const query = ConseilQueryBuilder.setLimit(ConseilQueryBuilder.blankQuery(), 2);
        const result = await TezosConseilClient.getAccounts({ url: 'http://conseil.server', apiKey: 'c0ffee' }, 'alphanet', query);

        expect(result.length).to.equal(2);
        expect(result[1]['counter']).to.equal(23);
    }));

    it('TezosConseilClient.getOperationGroups', mochaAsync(async () => {
        const nockedserver = nock('http://conseil.server');
        nockedserver.post('/v2/data/tezos/alphanet/operation_groups').reply(200, operationgroups);

        const query = ConseilQueryBuilder.setLimit(ConseilQueryBuilder.blankQuery(), 3);
        const result = await TezosConseilClient.getOperationGroups({ url: 'http://conseil.server', apiKey: 'c0ffee' }, 'alphanet', query);

        expect(result.length).to.equal(3);
        expect(result[1]['block_id']).to.equal('BLPcavx4rhmZqCot3aZ3TiHdjQ4Ad5Tzs8WPmwJEeuxPx7F2GvQ');
    }));

    it('TezosConseilClient.getOperations', mochaAsync(async () => {
        const nockedserver = nock('http://conseil.server');
        nockedserver.post('/v2/data/tezos/alphanet/operations').reply(200, operations);

        let query = ConseilQueryBuilder.blankQuery();
        query = ConseilQueryBuilder.addPredicate(query, 'kind', ConseilOperator.EQ, ['transaction'], false);
        query = ConseilQueryBuilder.addOrdering(query, 'block_level', ConseilSortDirection.DESC);
        query = ConseilQueryBuilder.setLimit(query, 5);
        const result = await TezosConseilClient.getOperations({ url: 'http://conseil.server', apiKey: 'c0ffee' }, 'alphanet', query);

        expect(result.length).to.equal(5);
        expect(result[1]['timestamp']).to.be.greaterThan(result[2]['timestamp']);
    }));

    it('TezosConseilClient.getFeeStatistics', async () => {
        const nockedserver = nock('http://conseil.server');
        nockedserver.post('/v2/data/tezos/alphanet/fees').reply(200, transactionfees);

        const fees = await TezosConseilClient.getFeeStatistics({ url: 'http://conseil.server', apiKey: 'c0ffee' }, 'alphanet', OperationKindType.Transaction);

        expect(fees[0]['low']).to.lessThan(fees[0]['medium']);
        expect(fees[0]['medium']).to.lessThan(fees[0]['high']);
    });

    it('TezosConseilClient.getBlock error', async () => {
        const nockedserver = nock('http://conseil.server');
        nockedserver.post('/v2/data/tezos/alphanet/blocks').reply(200, badJSON);

        await expect(TezosConseilClient.getBlock({ url: 'http://conseil.server', apiKey: 'c0ffee' }, 'alphanet', 'BL5zoNBN17j2AcUrs8mqSKSMcEiuBKkd9RB6uZ6CgYE2Xyb2ybV'))
        .be.rejected;
    });
    
});

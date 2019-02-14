import "mocha";
import { expect } from "chai";
import nock from 'nock';

import fetch from 'node-fetch';
import FetchSelector from '../src/utils/FetchSelector';
FetchSelector.setFetch(fetch);

import {TezosConseilClient} from '../src/reporting/tezos/TezosConseilClient';
import {ConseilQueryBuilder} from '../src/reporting/ConseilQueryBuilder';

import mochaAsync from '../test/mochaTestHelper';

import {
    blockHead, blocks, accounts, operationgroups, operationgroup
} from './TezosConseilClient.responses';

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
        nockedserver.post('/v2/data/tezos/alphanet/blocks').reply(200, blocks);

        const result = await TezosConseilClient.getBlock({ url: 'http://conseil.server', apiKey: 'c0ffee' }, 'alphanet', 'BL5zoNBN17j2AcUrs8mqSKSMcEiuBKkd9RB6uZ6CgYE2Xyb2ybV');

        expect(result.length).to.equal(2);
        expect(result[1]['predecessor']).to.equal('BLyxiXprmaDkCeZo3b9JHU4udjPiVUpuTR1eKXSxtJe9o8JMbiM');
    }));

    it('TezosConseilClient.getAccount', mochaAsync(async () => {
        const nockedserver = nock('http://conseil.server');
        nockedserver.post('/v2/data/tezos/alphanet/accounts').reply(200, accounts);

        const result = await TezosConseilClient.getAccount({ url: 'http://conseil.server', apiKey: 'c0ffee' }, 'alphanet', 'tz1L8MjMxQJio8YmmfdFbbVSymbNx5uiX3XT');

        expect(result.length).to.equal(2);
        expect(result[1]['manager']).to.equal('tz1L8MjMxQJio8YmmfdFbbVSymbNx5uiX3XT');
    }));

    it('TezosConseilClient.getOperationGroup', mochaAsync(async () => {
        const nockedserver = nock('http://conseil.server');
        nockedserver.post('/v2/data/tezos/alphanet/operation_groups').reply(200, operationgroup);

        const result = await TezosConseilClient.getOperationGroup({ url: 'http://conseil.server', apiKey: 'c0ffee' }, 'alphanet', 'ooYPxHKwUgkXxbWVfZFuYnvjNuGtrAgRQEtNrbPXNiwTBbCFW9j');

        expect(result.length).to.equal(1);
        expect(result[0]['branch']).to.equal('BLA3ecN7jh6Vc7XmogePRsdAjjbueG9NHsb32ByL5nbAhMvcNxK');
    }));

    //getBlocks
    //getAccounts

    it('TezosConseilClient.getOperationGroups', mochaAsync(async () => {
        const nockedserver = nock('http://conseil.server');
        nockedserver.post('/v2/data/tezos/alphanet/operation_groups').reply(200, operationgroups);

        const query = ConseilQueryBuilder.setLimit(ConseilQueryBuilder.blankQuery(), 3);
        const result = await TezosConseilClient.getOperationGroups({ url: 'http://conseil.server', apiKey: 'c0ffee' }, 'alphanet', query);

        expect(result.length).to.equal(3);
        expect(result[1]['block_id']).to.equal('BLPcavx4rhmZqCot3aZ3TiHdjQ4Ad5Tzs8WPmwJEeuxPx7F2GvQ');
    }));

    //getOperations
});

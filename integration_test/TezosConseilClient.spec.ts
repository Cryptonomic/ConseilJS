import 'mocha';
import {expect} from 'chai';
import fetch from 'node-fetch';

import FetchSelector from '../src/utils/FetchSelector';
FetchSelector.setFetch(fetch);

import {ConseilQueryBuilder} from "../src/reporting/ConseilQueryBuilder";
import {ConseilQuery, ConseilOperator, ConseilServerInfo, ConseilSortDirection} from "../src/types/conseil/QueryTypes"
import {TezosConseilClient} from '../src/reporting/tezos/TezosConseilClient'
import {servers} from "./servers";

const util = require('util');

const ConseilV2URL = servers.conseilServer;
const ConseilV2APIKey = servers.conseilApiKey;

describe('Tezos date interface test suite', () => {
    it('retrieve top block', async () => {
        const result = await TezosConseilClient.getBlockHead({url: ConseilV2URL, apiKey: ConseilV2APIKey}, 'alphanet');

        expect(result.length).to.equal(1);
    });

    it('retrieve a block by hash', async () => {
        const result = await TezosConseilClient.getBlock({url: ConseilV2URL, apiKey: ConseilV2APIKey}, 'alphanet', 'BKnMKWCeJwRtetQwuY5HRtbrsXPLyACFrygdwnM8jxAYcYEVkdd');

        expect(result.length).to.equal(1);
    });

    it('retrieve an account by address', async () => {
        const result = await TezosConseilClient.getAccount({url: ConseilV2URL, apiKey: ConseilV2APIKey}, 'alphanet', 'tz1UzDGcT9JAZnryiDJmvGnNRMg3WzVnjLrn');

        expect(result.length).to.equal(1);
    });

    //getOperationGroup

    it('retrieve some blocks', async () => {
        let q = ConseilQueryBuilder.blankQuery();
        q = ConseilQueryBuilder.addPredicate(q, 'level', ConseilOperator.LT, [1000], true);
        q = ConseilQueryBuilder.addOrdering(q, 'level', ConseilSortDirection.ASC);
        q = ConseilQueryBuilder.setLimit(q, 10);

        const result = await TezosConseilClient.getBlocks({url: ConseilV2URL, apiKey: ConseilV2APIKey}, 'alphanet', q);

        expect(result.length).to.equal(10);
        expect(parseInt(result[9]["level"])).to.greaterThan(parseInt(result[1]["level"]));
        expect(result[9]["predecessor"]).to.equal(result[8]["hash"]);
    });

    it('retrieve a single an account', async () => {
        var result = await TezosConseilClient.getAccount({url: ConseilV2URL, apiKey: ConseilV2APIKey}, 'alphanet', 'tz1XErrAm8vFBzu69UU74JUSbvsmvXiQBy6e');

        //console.log(util.inspect(result, {showHidden: false, depth: 5, colors: false, maxArrayLength: 100}));
    });

    it('retrieve a accounts for a manager address', async () => {
        let accountsquery = ConseilQueryBuilder.blankQuery();
        accountsquery = ConseilQueryBuilder.addPredicate(accountsquery, 'manager', ConseilOperator.EQ, ['tz1XErrAm8vFBzu69UU74JUSbvsmvXiQBy6e'], false);
        accountsquery = ConseilQueryBuilder.addOrdering(accountsquery, 'block_level', ConseilSortDirection.DESC);
        accountsquery = ConseilQueryBuilder.setLimit(accountsquery, 300);
        const accounts = await TezosConseilClient.getAccounts({url: ConseilV2URL, apiKey: ConseilV2APIKey}, 'alphanet', accountsquery);

        console.log(accounts.length);
        console.log(accounts.filter(a => a.account_id !== 'tz1XErrAm8vFBzu69UU74JUSbvsmvXiQBy6e').length);
        //console.log(util.inspect(accounts, {showHidden: false, depth: 5, colors: false, maxArrayLength: 100}));
        //console.log(util.inspect(accountsquery, {showHidden: false, depth: 5, colors: false, maxArrayLength: 100}));
    });

    //getOperationGroups

    it('retrieve transactions for an account', async () => {
        let origin = ConseilQueryBuilder.blankQuery();
        origin = ConseilQueryBuilder.addPredicate(origin, 'kind', ConseilOperator.IN, ['transaction', 'activate_account', 'reveal', 'origination', 'delegation'], false);
        origin = ConseilQueryBuilder.addPredicate(origin, 'source', ConseilOperator.EQ, ['tz1aCy8b6Ls4Gz7m5SbANjtMPiH6dZr9nnS2'], false);
        origin = ConseilQueryBuilder.addOrdering(origin, 'block_level', ConseilSortDirection.DESC);
        origin = ConseilQueryBuilder.setLimit(origin, 300);

        let target = ConseilQueryBuilder.blankQuery();
        target = ConseilQueryBuilder.addPredicate(target, 'kind', ConseilOperator.IN, ['transaction', 'activate_account', 'reveal', 'origination', 'delegation'], false);
        target = ConseilQueryBuilder.addPredicate(target, 'destination', ConseilOperator.EQ, ['tz1aCy8b6Ls4Gz7m5SbANjtMPiH6dZr9nnS2'], false);
        target = ConseilQueryBuilder.addOrdering(target, 'block_level', ConseilSortDirection.DESC);
        target = ConseilQueryBuilder.setLimit(target, 300);

        var result = await Promise.all([target, origin].map(q => TezosConseilClient.getOperations({url: ConseilV2URL, apiKey: ConseilV2APIKey}, 'alphanet', q)))
            .then(responses => responses.reduce((result, r) => { r.forEach(rr => result.push(rr)); return result; }));

        expect(result.length).to.equal(9, 'this may vary as the network changes');
    });

    it('calculate average fees for transaction type operations', async () => {
        let operationFeesQuery = ConseilQueryBuilder.blankQuery();
        operationFeesQuery = ConseilQueryBuilder.addFields(operationFeesQuery, 'fee');
        operationFeesQuery = ConseilQueryBuilder.addPredicate(operationFeesQuery, 'kind', ConseilOperator.EQ, ['transaction'], false);
        operationFeesQuery = ConseilQueryBuilder.addOrdering(operationFeesQuery, 'block_level', ConseilSortDirection.DESC);
        operationFeesQuery = ConseilQueryBuilder.setLimit(operationFeesQuery, 1000);

        const fees = await TezosConseilClient.getOperations({url: ConseilV2URL, apiKey: ConseilV2APIKey}, 'alphanet', operationFeesQuery);
        const sortedfees = fees.map(f => parseInt(f['fee'])).sort((a, b) => a - b);

        const lowAverageFee = sortedfees.slice(0, 300).reduce((s, c) => s + c) / 300;
        const mediumAverageFee = sortedfees.slice(300, 700).reduce((s, c) => s + c) / 400;
        const highAverageFee = sortedfees.slice(700).reduce((s, c) => s + c) / 300;


        expect(lowAverageFee).to.lessThan(mediumAverageFee);
        expect(mediumAverageFee).to.lessThan(highAverageFee);
    });

    it('retrieve average fees for transaction type operations', async () => {
        let operationFeesQuery = ConseilQueryBuilder.blankQuery();
        operationFeesQuery = ConseilQueryBuilder.addFields(operationFeesQuery, 'low', 'medium', 'high');
        operationFeesQuery = ConseilQueryBuilder.addPredicate(operationFeesQuery, 'kind', ConseilOperator.EQ, ['transaction'], false);
        operationFeesQuery = ConseilQueryBuilder.addOrdering(operationFeesQuery, 'timestamp', ConseilSortDirection.DESC);
        operationFeesQuery = ConseilQueryBuilder.setLimit(operationFeesQuery, 1);

        const fees = await TezosConseilClient.getTezosEntityData({url: ConseilV2URL, apiKey: ConseilV2APIKey}, 'alphanet', 'fees', operationFeesQuery);

        expect(fees[0]['low']).to.lessThan(fees[0]['medium']);
        expect(fees[0]['medium']).to.lessThan(fees[0]['high']);
    });
});

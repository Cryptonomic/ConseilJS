import 'mocha';
import {expect} from 'chai';
import {ConseilQueryBuilder} from "../../src/utils/v2/ConseilQuery";
import {ConseilQuery, ConseilOperator, ConseilServerInfo, ConseilSortDirection} from "../../src/utils/v2/QueryTypes"
import {TezosConseilClient} from '../../src/tezos/TezosConseilClient'
import {servers} from "../servers";

const ConseilV2URL = servers.conseilServer;
const ConseilV2APIKey = servers.conseilApiKey;

describe('Tezos date interface test suite', () => {
    it('retrieve top block', async () => {
        const result = await TezosConseilClient.getBlockHead({url: ConseilV2URL, apiKey: ConseilV2APIKey}, 'alphanet');

        console.log(result);
        //expect(result).to.contain('tezos');
    });

    it('retrieve a block by hash', async () => {
        const result = await TezosConseilClient.getBlock({url: ConseilV2URL, apiKey: ConseilV2APIKey}, 'alphanet', 'BKnMKWCeJwRtetQwuY5HRtbrsXPLyACFrygdwnM8jxAYcYEVkdd');

        console.log(result);
        //expect(result).to.contain('tezos');
    });

    it('retrieve an account by address', async () => {
        const result = await TezosConseilClient.getAccount({url: ConseilV2URL, apiKey: ConseilV2APIKey}, 'alphanet', 'tz1UzDGcT9JAZnryiDJmvGnNRMg3WzVnjLrn');

        console.log(result);
        //expect(result).to.contain('tezos');
    });

    //getOperationGroup

    it('retrieve some blocks', async () => {
        let q = ConseilQueryBuilder.blankQuery();
        q = ConseilQueryBuilder.addPredicate(q, 'level', ConseilOperator.LT, [1000], true);
        q = ConseilQueryBuilder.addOrdering(q, 'level', ConseilSortDirection.ASC);
        q = ConseilQueryBuilder.setLimit(q, 10);

        const result = await TezosConseilClient.getBlocks({url: ConseilV2URL, apiKey: ConseilV2APIKey}, 'alphanet', q);

        console.log(result);
        //expect(result).to.contain('tezos');
    });

    //getAccounts

    //getOperationGroups

    //getOperations
});

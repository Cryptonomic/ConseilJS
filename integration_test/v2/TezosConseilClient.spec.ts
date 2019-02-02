import 'mocha';
import {expect} from 'chai';
import {ConseilQueryBuilder} from "../../src/utils/conseil/ConseilQueryBuilder";
import {ConseilQuery, ConseilOperator, ConseilServerInfo, ConseilSortDirection} from "../../src/types/conseil/QueryTypes"
import {TezosConseilClient} from '../../src/tezos/TezosConseilClient'
import {servers} from "../servers";

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

    //getAccounts

    //getOperationGroups

    //getOperations
});

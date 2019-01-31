import 'mocha';
import {expect} from 'chai';
import {ConseilDataClient} from '../../src/utils/v2/ConseilDataClient';
import {ConseilQueryBuilder} from '../../src/utils/v2/ConseilQueryBuilder';
import {ConseilServerInfo, ConseilSortDirection, ConseilOperator} from '../../src/utils/v2/QueryTypes';
import {servers} from "../servers";

//https://conseil-dev.cryptonomic-infra.tech:443
//https://tezos-dev.cryptonomic-infra.tech:443/chains/main/blocks/head
const ConseilV2URL = servers.conseilServer;
const ConseilV2APIKey = servers.conseilApiKey;

describe('ConseilDataClient test suite', () => {
    it('should fetch delegations in a block range', async () => {
      const conseilServer: ConseilServerInfo = {
        url: ConseilV2URL,
        apiKey: ConseilV2APIKey
      };

      let query = ConseilQueryBuilder.blankQuery();
      query = ConseilQueryBuilder.addFields(query, 'operation_group_hash','block_level','kind','source','delegate');
      query = ConseilQueryBuilder.setLimit(query, 1000);
      query = ConseilQueryBuilder.addOrdering(query, 'balance', ConseilSortDirection.DESC);
      query = ConseilQueryBuilder.addPredicate(query, 'kind', ConseilOperator.EQ, ['delegation'], false);
      query = ConseilQueryBuilder.addPredicate(query, 'block_level', ConseilOperator.BETWEEN, [10000,12000], false);

      const result = await ConseilDataClient.executeEntityQuery(conseilServer, 'tezos', 'alphanet', 'operations', query);
      expect(result.length).to.equal(5);
    });
});

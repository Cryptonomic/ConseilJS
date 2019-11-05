import 'mocha';
import { expect } from 'chai';
import fetch from 'node-fetch';

import * as loglevel from 'loglevel';
import LogSelector from '../../../src/utils/LoggerSelector';
LogSelector.setLogger(loglevel.getLogger('conseiljs'));

import FetchSelector from '../../../src/utils/FetchSelector';
FetchSelector.setFetch(fetch);

import { TezosContractIntrospector } from '../../../src/chain/tezos/TezosContractIntrospector';
import { EntryPoint } from '../../../src/types/tezos/ContractIntrospectionTypes';
import { ConseilQueryBuilder } from '../../../src/reporting/ConseilQueryBuilder';
import { ConseilOperator, ConseilFunction, ConseilSortDirection } from '../../../src/types/conseil/QueryTypes';
import { ConseilDataClient } from '../../../src/reporting/ConseilDataClient';
import { conseilServer } from '../../TestAssets';

describe('TezosContractIntrospector integration test suite', () => {
    it('Generate entry points for Tezos Baker Registry (Alphanet)', async () => {
        const result: EntryPoint[] = await TezosContractIntrospector.generateEntryPointsFromAddress(conseilServer, conseilServer.network, 'KT1NpCh6tNQDmbmAVbGLxwRBx8jJD4rEFnmC');

        expect(result[0].name).to.equal('%_Liq_entry_updateName');
        expect(result[0].parameters.length).to.equal(1);
        expect(result[0].generateParameter('"param1"')).to.equal('(Left "param1")');

        expect(result[1].name).to.equal('%_Liq_entry_updatePaymentAddress');
        expect(result[1].parameters.length).to.equal(1);
        expect(result[1].generateParameter('"param1"')).to.equal('(Right (Left "param1"))');

        expect(result[2].name).to.equal('%_Liq_entry_updateTerms');
        expect(result[2].parameters.length).to.equal(3);
        expect(result[2].generateParameter(1, 2, 3)).to.equal('(Right (Right (Left (Pair 1 (Pair 2 3)))))');

        expect(result[3].name).to.equal('%_Liq_entry_deleteRegistration');
        expect(result[3].parameters.length).to.equal(1);
        expect(result[3].generateParameter('Unit')).to.equal('(Right (Right (Right Unit)))');
    });

    it('Process on-chain contracts', async () => {
        let contractQuery = ConseilQueryBuilder.blankQuery();
        contractQuery = ConseilQueryBuilder.addFields(contractQuery, 'account_id', 'script');
        contractQuery = ConseilQueryBuilder.addPredicate(contractQuery, 'account_id', ConseilOperator.STARTSWITH, ['KT1']);
        contractQuery = ConseilQueryBuilder.addPredicate(contractQuery, 'script', ConseilOperator.ISNULL, [], true);
        contractQuery = ConseilQueryBuilder.addAggregationFunction(contractQuery, 'account_id', ConseilFunction.count);
        contractQuery = ConseilQueryBuilder.addOrdering(contractQuery, 'count_account_id', ConseilSortDirection.DESC)
        contractQuery = ConseilQueryBuilder.setLimit(contractQuery, 100);

        const contractList = await ConseilDataClient.executeEntityQuery(conseilServer, 'tezos', conseilServer.network, 'accounts', contractQuery);

        contractList.forEach(r => {
            if (r['script'].startsWith('Unparsable code:')) { return; } // accounting for invalid Conseil results

            try {
                let p = TezosContractIntrospector.generateEntryPointsFromCode(r['script']);
            } catch (error) {
                console.log(`error ${error}\n----\n${r['script']}\n----\n`);
            }
        });
    });
});

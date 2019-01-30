import 'mocha';
import {expect} from 'chai';
import {ConseilQueryBuilder} from "../src/utils/v2/ConseilQuery";
import {ConseilQuery, ConseilOperator, ConseilServerInfo, ConseilSortDirection} from "../src/utils/v2/QueryTypes"
import {ConseilDataClient} from "../src/utils/v2/ConseilDataClient";


describe('ConseilJS query builder for Conseil protocol v2 test suite', () => {
    it('make a blank query', async () => {
        const query = ConseilQueryBuilder.blankQuery();

        expect(query.fields.length).to.equals(0);
        expect(query.limit).to.equals(100);
    });

    it('make empty query with a sort condition', async () => {
        const query = ConseilQueryBuilder.addOrdering(ConseilQueryBuilder.blankQuery(), 'level', ConseilSortDirection.DESC);

        expect(query.orderBy[0].direction).to.equals(ConseilSortDirection.DESC);
        expect(query.orderBy[0].field).to.equals('level');
    });

    it('set a limit on a blank query', async () => {
        const query = ConseilQueryBuilder.setLimit(ConseilQueryBuilder.blankQuery(), 1);

        expect(query.limit).to.equals(1);
    });

    it('make a query with two fields', async () => {
        const query = ConseilQueryBuilder.addFields(ConseilQueryBuilder.blankQuery(), 'field 1', 'field 2');

        expect(query.fields.length).to.equals(2);
        expect(query.fields[0]).to.equals('field 1');
        expect(query.fields[1]).to.equals('field 2');
    });
});

import 'mocha';
import {expect} from 'chai';
import {ConseilQueryBuilder} from "../src/reporting/ConseilQueryBuilder";
import {ConseilOperator, ConseilSortDirection} from "../src/types/conseil/QueryTypes"


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

    it('make a query with a predicate', async () => {
        const query = ConseilQueryBuilder.addPredicate(ConseilQueryBuilder.blankQuery(), "field 1", ConseilOperator.IN, ['a', 'b', 'c', 'd']);

        expect(query.predicates.length).to.equals(1);
        expect(query.predicates[0].field).to.equals('field 1');
        expect(query.predicates[0].operation).to.equals(ConseilOperator.IN);
        expect(query.predicates[0].set).to.contains('b');
        expect(query.predicates[0].inverse).to.equals(false);
    });

    it('predecate creation error conditions', async () => {
        expect(() => ConseilQueryBuilder.addPredicate(ConseilQueryBuilder.blankQuery(), "field 1", ConseilOperator.BETWEEN, ['a', 'b', 'c'])).to.throw("BETWEEN operation requires a list of two values.");
        expect(() => ConseilQueryBuilder.addPredicate(ConseilQueryBuilder.blankQuery(), "field 1", ConseilOperator.IN, ['a'])).to.throw("IN operation requires a list of two or more values.");
        expect(() => ConseilQueryBuilder.addPredicate(ConseilQueryBuilder.blankQuery(), "field 1", ConseilOperator.EQ, ['a', 'b'])).to.throw("invalid values list for eq.");
    });
});

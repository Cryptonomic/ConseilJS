import 'mocha';
import {expect} from 'chai';
import {ConseilQueryBuilder} from "../../src/reporting/ConseilQueryBuilder";
import {ConseilOperator, ConseilSortDirection, ConseilOutput, ConseilFunction} from "../../src/types/conseil/QueryTypes"


describe('ConseilJS query builder for Conseil protocol v2 test suite', () => {
    it('make a blank query', () => {
        const query = ConseilQueryBuilder.blankQuery();

        expect(query.fields.length).to.equals(0);
        expect(query.limit).to.equals(100);
    });

    it('make empty query with a sort condition', () => {
        const query = ConseilQueryBuilder.addOrdering(ConseilQueryBuilder.addOrdering(ConseilQueryBuilder.blankQuery(), 'level', ConseilSortDirection.DESC), 'signature');

        expect(query.orderBy[0].direction).to.equals(ConseilSortDirection.DESC);
        expect(query.orderBy[0].field).to.equals('level');
    });

    it('set a limit on a blank query', () => {
        const query = ConseilQueryBuilder.setLimit(ConseilQueryBuilder.blankQuery(), 1);

        expect(query.limit).to.equals(1);
    });

    it('make a query with two fields', () => {
        const query = ConseilQueryBuilder.addFields(ConseilQueryBuilder.blankQuery(), 'field 1', 'field 2');

        expect(query.fields.length).to.equals(2);
        expect(query.fields[0]).to.equals('field 1');
        expect(query.fields[1]).to.equals('field 2');
    });

    it('make a query with a predicate', () => {
        const query = ConseilQueryBuilder.addPredicate(ConseilQueryBuilder.blankQuery(), "field 1", ConseilOperator.IN, ['a', 'b', 'c', 'd']);

        expect(query.predicates.length).to.equals(1);
        expect(query.predicates[0].field).to.equals('field 1');
        expect(query.predicates[0].operation).to.equals(ConseilOperator.IN);
        expect(query.predicates[0].set).to.contains('b');
        expect(query.predicates[0].inverse).to.equals(false);
    });

    it('predecate creation error conditions', () => {
        expect(() => ConseilQueryBuilder.addPredicate(ConseilQueryBuilder.blankQuery(), "field 1", ConseilOperator.BETWEEN, ['a', 'b', 'c'])).to.throw("BETWEEN operation requires a list of two values.");
        expect(() => ConseilQueryBuilder.addPredicate(ConseilQueryBuilder.blankQuery(), "field 1", ConseilOperator.IN, ['a'])).to.throw("IN operation requires a list of two or more values.");
        expect(() => ConseilQueryBuilder.addPredicate(ConseilQueryBuilder.blankQuery(), "field 1", ConseilOperator.EQ, ['a', 'b'])).to.throw("invalid values list for eq.");
        expect(() => ConseilQueryBuilder.setLimit(ConseilQueryBuilder.blankQuery(), 0)).to.throw('Limit cannot be less than one.');
    });

    it('make a query with csv output', () => {
        const query = ConseilQueryBuilder.setOutputType(ConseilQueryBuilder.addFields(ConseilQueryBuilder.blankQuery(), 'field 1', 'field 2'), ConseilOutput.csv);

        expect(query.output).to.be.not.null;
        expect(query.output).to.equals('csv');
    });

    it('make a query with an aggregation function', () => {
        const query = ConseilQueryBuilder.addAggregationFunction(ConseilQueryBuilder.addFields(ConseilQueryBuilder.blankQuery(), 'field 1', 'field 2'), 'field 1', ConseilFunction.sum);

        if (query.aggregation !== undefined) {
            expect(query.aggregation).to.be.not.null;
            expect(query.aggregation[0].field).to.equals('field 1');
        }
    });

    it('aggregation creation error conditions', () => {
        expect(() => ConseilQueryBuilder.addAggregationFunction(ConseilQueryBuilder.blankQuery(), 'field 1', ConseilFunction.sum)).to.throw('Cannot apply an aggregation function on a field not being returned.');
    });
});
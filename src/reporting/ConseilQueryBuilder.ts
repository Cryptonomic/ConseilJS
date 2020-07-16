import {ConseilQuery, ConseilOperator, ConseilSortDirection, ConseilFunction, ConseilAggregation, ConseilOutput} from "../types/conseil/QueryTypes"

export namespace ConseilQueryBuilder {
    /**
     * Creates an empty ConseilQuery object with limit set to 100.
     */
    export function blankQuery(): ConseilQuery {
        return {
            fields: [],
            predicates: [],
            orderBy: [],
            aggregation: [],
            limit: 100
        }
    }

    /**
     * Appends one or more fields to the query. A new query object is returned.
     * 
     * @param query Source query.
     * @param fields Fields to add.
     */
    export function addFields(query: ConseilQuery, ...fields: string[]): ConseilQuery {
        let q = {...query};
        let fieldSet = new Set(query.fields);
        fields.forEach(f => fieldSet.add(f));
        q.fields = Array.from(fieldSet.values());

        return q; 
    }

    /**
     * Appends a predicate to the query. A new query object is returned.
     * 
     * @param query Source query.
     * @param field Field to apply the operation to.
     * @param operation Operation to apply. ConseilOperator.IN requires two or more values, ConseilOperator.BETWEEN is inclusive and requires two values, all other operators require at least one value.
     * @param values Set of values to operate on.
     * @param invert Set inverse, default is false. This is equivalent to matching inside the set of values as in SQL IN command. Setting inverse true is interpreted as NOT IN.
     * @param group Set a group, default is undefined. Grouped predicates are OR'ed together.
     */
    export function addPredicate(query: ConseilQuery, field: string, operation: ConseilOperator, values: any[], invert: boolean = false, group: string | undefined = undefined): ConseilQuery {
        if (operation === ConseilOperator.BETWEEN && values.length !== 2) {
            throw new Error('BETWEEN operation requires a list of two values.');
        } else if (operation === ConseilOperator.IN && values.length < 2) {
            throw new Error('IN operation requires a list of two or more values.');
        } else if (values.length !== 1 && operation !== ConseilOperator.IN && operation !== ConseilOperator.BETWEEN && operation !== ConseilOperator.ISNULL) {
            throw new Error(`invalid values list for ${operation}.`);
        }

        let q = {...query};
        q.predicates.push({ field, operation, set: values, inverse: invert, group });

        return q;
    }

    /**
     * Appends an ordering instruction to the query. Ordering is possible on fields that are not part of the result set. A new query object is returned.
     * 
     * @param query Source query.
     * @param field Field name to order by.
     * @param direction Sort direction, default is ASC.
     */
    export function addOrdering(query: ConseilQuery, field: string, direction: ConseilSortDirection = ConseilSortDirection.ASC): ConseilQuery {
        // TODO: validate field uniqueness
        let q = {...query};
        q.orderBy.push({ field, direction });

        return q;
    }

    /**
     * Sets a maximum result set size on a query. A new query object is returned.
     * 
     * @param query Source query.
     * @param limit Maximum number of rows to return, must be 1 or more.
     */
    export function setLimit(query: ConseilQuery, limit: number): ConseilQuery {
        if (limit < 1) { throw new Error('Limit cannot be less than one.'); }

        let q = {...query};
        q.limit = limit;

        return q;
    }

    /**
     * Sets output data type.
     * 
     * @param query Source query.
     * @param limit Output type, 'json' (default), or 'csv'.
     */
    export function setOutputType(query: ConseilQuery, outputType: ConseilOutput): ConseilQuery {
        let q = {...query};
        q.output = outputType;

        return q;
    }

    /**
     * Add an aggregation function on a field that is already part of the selection.
     * 
     * @param query Source query.
     * @param field Field to aggregate.
     * @param {ConseilFunction} aggregationFunction Aggregation function to apply, not that not all functions are applicable to all fields, depending on data type.
     */
    export function addAggregationFunction(query: ConseilQuery, field: string, aggregationFunction: ConseilFunction): ConseilQuery {
        if (!query.fields.includes(field)) { throw new Error('Cannot apply an aggregation function on a field not being returned.'); }

        let q = {...query};
        q.aggregation.push({ 'field': field, 'function': aggregationFunction });

        return q;
    }
}

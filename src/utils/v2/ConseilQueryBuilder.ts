import {ConseilQuery, ConseilOperator, ConseilSortDirection} from "../v2/QueryTypes"

export namespace ConseilQueryBuilder {
    /**
     * Creates an empty ConseilQuery object with limit set to 100.
     */
    export function blankQuery(): ConseilQuery {
        return {
            'fields': [],
            'predicates': [],
            'orderBy': [],
            'limit': 100
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
     */
    export function addPredicate(query: ConseilQuery, field: string, operation: ConseilOperator, values: any[], invert: boolean = false): ConseilQuery {
        if (operation === ConseilOperator.BETWEEN && values.length !== 2) {
            throw new Error();
        } else if (operation === ConseilOperator.IN && values.length < 2) {
            throw new Error();
        } else if (values.length !== 1 && operation !== ConseilOperator.IN && operation !== ConseilOperator.BETWEEN) {
            throw new Error();
        }

        let q = {...query};
        q.predicates.push({ field, operation, set: values, inverse: invert });

        return q;
    }

    /**
     * Appends an ordering instructionc to the query. Ordering is possible on fields that are not part of the result set. A new query object is returned.
     * 
     * @param query Source query.
     * @param field Field name to order by.
     * @param direction Sort direction.
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
        if (limit < 1) { throw new Error(); }

        let q = {...query};
        q.limit = limit;

        return q;
    }
}

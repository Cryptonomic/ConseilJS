"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ConseilSortDirection;
(function (ConseilSortDirection) {
    ConseilSortDirection["ASC"] = "asc";
    ConseilSortDirection["DESC"] = "desc";
})(ConseilSortDirection = exports.ConseilSortDirection || (exports.ConseilSortDirection = {}));
var ConseilOperator;
(function (ConseilOperator) {
    ConseilOperator["BETWEEN"] = "between";
    ConseilOperator["EQ"] = "eq";
    ConseilOperator["IN"] = "in";
    ConseilOperator["LIKE"] = "like";
    ConseilOperator["LT"] = "lt";
    ConseilOperator["BEFORE"] = "before";
    ConseilOperator["GT"] = "gt";
    ConseilOperator["AFTER"] = "after";
    ConseilOperator["STARTSWITH"] = "startsWith";
    ConseilOperator["ENDSWITH"] = "endsWith";
})(ConseilOperator = exports.ConseilOperator || (exports.ConseilOperator = {}));
var ConseilQueryBuilder;
(function (ConseilQueryBuilder) {
    /**
     * Creates an empty ConseilQuery object with limit set to 100.
     */
    function blankQuery() {
        return {
            'fields': new Set(),
            'predicates': [],
            'orderBy': [],
            'limit': 100
        };
    }
    ConseilQueryBuilder.blankQuery = blankQuery;
    /**
     * Appends one or more fields to the query. A new query object is returned.
     *
     * @param query Source query.
     * @param fields Fields to add.
     */
    function addFields(query, ...fields) {
        let q = Object.assign({}, query);
        fields.forEach(f => q.fields.add(f));
        return q;
    }
    ConseilQueryBuilder.addFields = addFields;
    /**
     * Appends a predicate to the query. A new query object is returned.
     *
     * @param query Source query.
     * @param field Field to apply the operation to.
     * @param operation Operation to apply. ConseilOperator.IN requires two or more values, ConseilOperator.BETWEEN is inclusive and requires two values, all other operators require at least one value.
     * @param values Set of values to operate on.
     * @param invert Set inverse, default is false. This is equivalent to matching inside the set of values as in SQL IN command. Setting inverse true is interpreted as NOT IN.
     */
    function addPredicate(query, field, operation, values, invert = false) {
        if (operation === ConseilOperator.BETWEEN && values.length !== 2) {
            throw new Error();
        }
        else if (operation === ConseilOperator.IN && values.length < 2) {
            throw new Error();
        }
        else if (values.length !== 1) {
            throw new Error();
        }
        let q = Object.assign({}, query);
        q.predicates.concat({ field, operation, set: values, inverse: invert });
        return q;
    }
    ConseilQueryBuilder.addPredicate = addPredicate;
    /**
     * Appends an ordering instructionc to the query. Ordering is possible on fields that are not part of the result set. A new query object is returned.
     *
     * @param query Source query.
     * @param field Field name to order by.
     * @param direction Sort direction.
     */
    function addOrdering(query, field, direction = ConseilSortDirection.ASC) {
        // TODO: validate field uniqueness
        let q = Object.assign({}, query);
        q.orderBy.concat({ field, direction });
        return q;
    }
    ConseilQueryBuilder.addOrdering = addOrdering;
    /**
     * Sets a maximum result set size on a query. A new query object is returned.
     *
     * @param query Source query.
     * @param limit Maximum number of rows to return, must be 1 or more.
     */
    function setLimit(query, limit) {
        if (limit < 1) {
            throw new Error();
        }
        let q = Object.assign({}, query);
        q.limit = limit;
        return q;
    }
    ConseilQueryBuilder.setLimit = setLimit;
})(ConseilQueryBuilder = exports.ConseilQueryBuilder || (exports.ConseilQueryBuilder = {}));
//# sourceMappingURL=ConseilQuery.js.map
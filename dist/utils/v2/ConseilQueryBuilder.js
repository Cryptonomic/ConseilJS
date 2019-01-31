"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const QueryTypes_1 = require("../v2/QueryTypes");
var ConseilQueryBuilder;
(function (ConseilQueryBuilder) {
    function blankQuery() {
        return {
            'fields': [],
            'predicates': [],
            'orderBy': [],
            'limit': 100
        };
    }
    ConseilQueryBuilder.blankQuery = blankQuery;
    function addFields(query, ...fields) {
        let q = Object.assign({}, query);
        let fieldSet = new Set(query.fields);
        fields.forEach(f => fieldSet.add(f));
        q.fields = Array.from(fieldSet.values());
        return q;
    }
    ConseilQueryBuilder.addFields = addFields;
    function addPredicate(query, field, operation, values, invert = false) {
        if (operation === QueryTypes_1.ConseilOperator.BETWEEN && values.length !== 2) {
            throw new Error('BETWEEN operation requires a list of two values.');
        }
        else if (operation === QueryTypes_1.ConseilOperator.IN && values.length < 2) {
            throw new Error('IN operation requires a list of two or more values.');
        }
        else if (values.length !== 1 && operation !== QueryTypes_1.ConseilOperator.IN && operation !== QueryTypes_1.ConseilOperator.BETWEEN) {
            throw new Error(`invalid values list for ${operation}.`);
        }
        let q = Object.assign({}, query);
        q.predicates.push({ field, operation, set: values, inverse: invert });
        return q;
    }
    ConseilQueryBuilder.addPredicate = addPredicate;
    function addOrdering(query, field, direction = QueryTypes_1.ConseilSortDirection.ASC) {
        let q = Object.assign({}, query);
        q.orderBy.push({ field, direction });
        return q;
    }
    ConseilQueryBuilder.addOrdering = addOrdering;
    function setLimit(query, limit) {
        if (limit < 1) {
            throw new Error('Limit cannot be less than one.');
        }
        let q = Object.assign({}, query);
        q.limit = limit;
        return q;
    }
    ConseilQueryBuilder.setLimit = setLimit;
})(ConseilQueryBuilder = exports.ConseilQueryBuilder || (exports.ConseilQueryBuilder = {}));
//# sourceMappingURL=ConseilQueryBuilder.js.map
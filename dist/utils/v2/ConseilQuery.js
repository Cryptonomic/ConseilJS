"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const QueryTypes_1 = require("../v2/QueryTypes");
var ConseilQueryBuilder;
(function (ConseilQueryBuilder) {
    function blankQuery() {
        return {
            'fields': new Set(),
            'predicates': [],
            'orderBy': [],
            'limit': 100
        };
    }
    ConseilQueryBuilder.blankQuery = blankQuery;
    function addFields(query, ...fields) {
        let q = Object.assign({}, query);
        fields.forEach(f => q.fields.add(f));
        return q;
    }
    ConseilQueryBuilder.addFields = addFields;
    function addPredicate(query, field, operation, values, invert = false) {
        if (operation === QueryTypes_1.ConseilOperator.BETWEEN && values.length !== 2) {
            throw new Error();
        }
        else if (operation === QueryTypes_1.ConseilOperator.IN && values.length < 2) {
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
    function addOrdering(query, field, direction = QueryTypes_1.ConseilSortDirection.ASC) {
        let q = Object.assign({}, query);
        q.orderBy.concat({ field, direction });
        return q;
    }
    ConseilQueryBuilder.addOrdering = addOrdering;
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
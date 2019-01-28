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
class ConseilQuery {
    constructor() {
        this.fields = new Set();
        this.predicates = [];
        this.orderBy = [];
        this.limit = 100;
    }
    addField(field) {
        this.fields.add(field);
        return this;
    }
    addFields(fields) {
        fields.forEach(f => this.fields.add(f));
        return this;
    }
    addPredicate(field, operation, values, invert = false) {
        if (operation === ConseilOperator.BETWEEN && values.length !== 2) {
            throw new Error();
        }
        else if (operation === ConseilOperator.IN && values.length < 2) {
            throw new Error();
        }
        else if (values.length !== 1) {
            throw new Error();
        }
        this.predicates.concat({ field, operation, set: values, inverse: invert });
        return this;
    }
    setOrdering(field, direction = ConseilSortDirection.ASC) {
        // TODO: validate field uniqueness
        this.orderBy.concat({ field, direction });
        return this;
    }
    setLimit(limit) {
        if (limit < 1) {
            throw new Error();
        }
        this.limit = limit;
        return this;
    }
}
exports.ConseilQuery = ConseilQuery;
//# sourceMappingURL=ConseilQuery.js.map
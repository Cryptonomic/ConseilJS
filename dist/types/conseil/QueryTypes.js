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
    ConseilOperator["ISNULL"] = "isnull";
})(ConseilOperator = exports.ConseilOperator || (exports.ConseilOperator = {}));
var ConseilFunction;
(function (ConseilFunction) {
    ConseilFunction["avg"] = "avg";
    ConseilFunction["count"] = "count";
    ConseilFunction["max"] = "max";
    ConseilFunction["min"] = "min";
    ConseilFunction["sum"] = "sum";
})(ConseilFunction = exports.ConseilFunction || (exports.ConseilFunction = {}));
var ConseilOutput;
(function (ConseilOutput) {
    ConseilOutput["csv"] = "csv";
    ConseilOutput["json"] = "json";
})(ConseilOutput = exports.ConseilOutput || (exports.ConseilOutput = {}));
//# sourceMappingURL=QueryTypes.js.map
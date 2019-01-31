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
class ConseilRequestError extends Error {
    constructor(httpStatus, httpMessage, conseilURL, conseilQuery) {
        super();
        this.httpStatus = httpStatus;
        this.httpMessage = httpMessage;
        this.conseilURL = conseilURL;
        this.conseilQuery = conseilQuery;
    }
}
exports.ConseilRequestError = ConseilRequestError;
//# sourceMappingURL=QueryTypes.js.map
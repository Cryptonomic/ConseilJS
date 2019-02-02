"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
class ConseilResponseError extends Error {
    constructor(httpStatus, httpMessage, conseilURL, conseilQuery, response) {
        super();
        this.httpStatus = httpStatus;
        this.httpMessage = httpMessage;
        this.conseilURL = conseilURL;
        this.conseilQuery = conseilQuery;
        this.response = response;
    }
}
exports.ConseilResponseError = ConseilResponseError;
//# sourceMappingURL=ErrorTypes.js.map
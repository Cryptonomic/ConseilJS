"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ServiceRequestError extends Error {
    constructor(httpStatus, httpMessage, conseilURL, data) {
        super();
        this.httpStatus = httpStatus;
        this.httpMessage = httpMessage;
        this.conseilURL = conseilURL;
        this.data = data;
    }
}
exports.ServiceRequestError = ServiceRequestError;
class ConseilRequestError extends ServiceRequestError {
    constructor(httpStatus, httpMessage, conseilURL, conseilQuery) {
        super(httpStatus, httpMessage, conseilURL, null);
        this.conseilQuery = conseilQuery;
    }
    toString() {
        return `ConseilRequestError for ${this.conseilURL} with ${this.httpStatus} and ${this.httpMessage}`;
    }
}
exports.ConseilRequestError = ConseilRequestError;
class ServiceResponseError extends Error {
    constructor(httpStatus, httpMessage, conseilURL, data, response) {
        super();
        this.httpStatus = httpStatus;
        this.httpMessage = httpMessage;
        this.conseilURL = conseilURL;
        this.data = data;
        this.response = response;
    }
}
exports.ServiceResponseError = ServiceResponseError;
class ConseilResponseError extends ServiceResponseError {
    constructor(httpStatus, httpMessage, conseilURL, conseilQuery, response) {
        super(httpStatus, httpMessage, conseilURL, null, response);
        this.conseilQuery = conseilQuery;
    }
}
exports.ConseilResponseError = ConseilResponseError;
//# sourceMappingURL=ErrorTypes.js.map
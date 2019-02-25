import {ConseilQuery} from "./QueryTypes";

/**
 * Object to store details of an HTTP request failure. This would describe an error generated after sending a request, things that didn't result in a 200, or similarly "ok" status code.
 */
export class ServiceRequestError extends Error {
    httpStatus: number;
    httpMessage: string;
    conseilURL: string;
    data: string | null;

    constructor(httpStatus: number, httpMessage: string, conseilURL: string, data: string | null){
        super();

        this.httpStatus = httpStatus;
        this.httpMessage = httpMessage;
        this.conseilURL = conseilURL;
        this.data = data;
    }
}

/**
 * A specialization of ServiceRequestError for Conseil service requests.
 */
export class ConseilRequestError extends ServiceRequestError {
    conseilQuery: ConseilQuery | null;

    constructor(httpStatus: number, httpMessage: string, conseilURL: string, conseilQuery: ConseilQuery | null){
        super(httpStatus, httpMessage, conseilURL, null);

        this.conseilQuery = conseilQuery;
    }
}

/**
 * A container for response failures. Meaning a response was sent by the server, but there was some issue processing it after it was received. 
 */
export class ServiceResponseError extends Error {
    httpStatus: number;
    httpMessage: string;
    conseilURL: string;
    data: string | null;
    response: any;

    constructor(httpStatus: number, httpMessage: string, conseilURL: string, data: string | null, response: any){
        super();

        this.httpStatus = httpStatus;
        this.httpMessage = httpMessage;
        this.conseilURL = conseilURL;
        this.data = data;
        this.response = response;
    }
}

/**
 * A specialization of ServiceResponseError for Conseil services.
 */
export class ConseilResponseError extends ServiceResponseError {
    conseilQuery: ConseilQuery | null;

    constructor(httpStatus: number, httpMessage: string, conseilURL: string, conseilQuery: ConseilQuery | null, response: any){
        super(httpStatus, httpMessage, conseilURL, null, response);

        this.conseilQuery = conseilQuery;
    }
}

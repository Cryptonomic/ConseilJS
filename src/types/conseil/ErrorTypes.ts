import {ConseilQuery} from "./QueryTypes";

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

export class ConseilRequestError extends ServiceRequestError {
    conseilQuery: ConseilQuery | null;

    constructor(httpStatus: number, httpMessage: string, conseilURL: string, conseilQuery: ConseilQuery | null){
        super(httpStatus, httpMessage, conseilURL, null);

        this.conseilQuery = conseilQuery;
    }
}

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

export class ConseilResponseError extends ServiceResponseError {
    conseilQuery: ConseilQuery | null;

    constructor(httpStatus: number, httpMessage: string, conseilURL: string, conseilQuery: ConseilQuery | null, response: any){
        super(httpStatus, httpMessage, conseilURL, null, response);

        this.conseilQuery = conseilQuery;
    }
}

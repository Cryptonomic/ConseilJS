import {ConseilQuery} from "./QueryTypes";

export class ConseilRequestError extends Error {
    httpStatus: number;
    httpMessage: string;
    conseilURL: string;
    conseilQuery: ConseilQuery | null;

    constructor(httpStatus: number, httpMessage: string, conseilURL: string, conseilQuery: ConseilQuery | null){
        super();

        this.httpStatus = httpStatus;
        this.httpMessage = httpMessage;
        this.conseilURL = conseilURL;
        this.conseilQuery = conseilQuery;
    }
}

export class ConseilResponseError extends Error {
    httpStatus: number;
    httpMessage: string;
    conseilURL: string;
    conseilQuery: ConseilQuery | null;
    response: any;

    constructor(httpStatus: number, httpMessage: string, conseilURL: string, conseilQuery: ConseilQuery | null, response: any){
        super();

        this.httpStatus = httpStatus;
        this.httpMessage = httpMessage;
        this.conseilURL = conseilURL;
        this.conseilQuery = conseilQuery;
        this.response = response;
    }
}

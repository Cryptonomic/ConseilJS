import { ConseilQuery } from "./QueryTypes";
export declare class ConseilRequestError extends Error {
    httpStatus: number;
    httpMessage: string;
    conseilURL: string;
    conseilQuery: ConseilQuery | null;
    constructor(httpStatus: number, httpMessage: string, conseilURL: string, conseilQuery: ConseilQuery | null);
}
export declare class ConseilResponseError extends Error {
    httpStatus: number;
    httpMessage: string;
    conseilURL: string;
    conseilQuery: ConseilQuery | null;
    response: any;
    constructor(httpStatus: number, httpMessage: string, conseilURL: string, conseilQuery: ConseilQuery | null, response: any);
}

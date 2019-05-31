import { ConseilQuery } from "./QueryTypes";
export declare class ServiceRequestError extends Error {
    httpStatus: number;
    httpMessage: string;
    conseilURL: string;
    data: string | null;
    constructor(httpStatus: number, httpMessage: string, conseilURL: string, data: string | null);
}
export declare class ConseilRequestError extends ServiceRequestError {
    conseilQuery: ConseilQuery | null;
    constructor(httpStatus: number, httpMessage: string, conseilURL: string, conseilQuery: ConseilQuery | null);
    toString(): string;
}
export declare class ServiceResponseError extends Error {
    httpStatus: number;
    httpMessage: string;
    conseilURL: string;
    data: string | null;
    response: any;
    constructor(httpStatus: number, httpMessage: string, conseilURL: string, data: string | null, response: any);
}
export declare class ConseilResponseError extends ServiceResponseError {
    conseilQuery: ConseilQuery | null;
    constructor(httpStatus: number, httpMessage: string, conseilURL: string, conseilQuery: ConseilQuery | null, response: any);
}

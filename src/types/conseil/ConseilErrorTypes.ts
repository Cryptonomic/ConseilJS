import { ServiceRequestError, ServiceResponseError } from '../ErrorTypes'
import { ConseilQuery } from './QueryTypes';

/**
 * A specialization of ServiceRequestError for Conseil service requests.
 */
export class ConseilRequestError extends ServiceRequestError {
    conseilQuery: ConseilQuery | null;

    constructor(httpStatus: number, httpMessage: string, serverURL: string, conseilQuery: ConseilQuery | null){
        super(httpStatus, httpMessage, serverURL, null);

        this.conseilQuery = conseilQuery;
    }

    toString() {
        return `ConseilRequestError for ${this.serverURL} with ${this.httpStatus} and ${this.httpMessage}`;
    }
}

/**
 * A specialization of ServiceResponseError for Conseil services.
 */
export class ConseilResponseError extends ServiceResponseError {
    conseilQuery: ConseilQuery | null;

    constructor(httpStatus: number, httpMessage: string, serverURL: string, conseilQuery: ConseilQuery | null, response: any){
        super(httpStatus, httpMessage, serverURL, null, response);

        this.conseilQuery = conseilQuery;
    }
}

import { ServiceRequestError, ServiceResponseError } from '../ErrorTypes'

/**
 * A specialization of ServiceRequestError for Tezos service requests.
 */
export class TezosRequestError extends ServiceRequestError {
    requestBody: string | null;

    constructor(httpStatus: number, httpMessage: string, serverURL: string, requestBody: string | null){
        super(httpStatus, httpMessage, serverURL, null);

        this.requestBody = requestBody;
    }

    toString() {
        return `TezosRequestError for ${this.serverURL} with ${this.httpStatus} and ${this.httpMessage}`;
    }
}

/**
 * A specialization of ServiceResponseError for Tezos services.
 */
export class TezosResponseError extends ServiceResponseError {
    kind: TezosResponseErrorKind;

    constructor(httpStatus: number, httpMessage: string, serverURL: string, requestBody: string | null, response: any, kind: TezosResponseErrorKind){
        super(httpStatus, httpMessage, serverURL, requestBody, response);

        this.kind = kind;
    }
}

/**
 * 
 */
export enum TezosResponseErrorKind {
    /**
     * The response is text
     */
    TEXT = 'Text',
    /**
     * The response is an array of objects containing `kind` and `id` properties.
     */
    JSONTYPE1 = 'JSONType1',
    /**
     * The response is an object with a `contents` array and a `signature` property. Elements inside `contents`
     * then have an internal structure with `['metadata']['operation_result']['status']` and
     * `['metadata']['operation_result']['errors']`.
     */
    JSONTYPE2 = 'JSONType2'
}

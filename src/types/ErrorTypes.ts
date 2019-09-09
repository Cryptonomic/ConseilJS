
/**
 * Object to store details of an HTTP request failure. This would describe an error generated after sending a request, things that didn't result in a 200, or similarly "ok" status code.
 */
export class ServiceRequestError extends Error {
    httpStatus: number;
    httpMessage: string;
    serverURL: string;
    data: string | null;

    constructor(httpStatus: number, httpMessage: string, serverURL: string, data: string | null){
        super();

        this.httpStatus = httpStatus;
        this.httpMessage = httpMessage;
        this.serverURL = serverURL;
        this.data = data;
    }
}

/**
 * A container for response failures. Meaning a response was sent by the server, but there was some issue processing it after it was received. 
 */
export class ServiceResponseError extends Error {
    httpStatus: number;
    httpMessage: string;
    serverURL: string;
    data: string | null;
    response: any;

    constructor(httpStatus: number, httpMessage: string, serverURL: string, data: string | null, response: any){
        super();

        this.httpStatus = httpStatus;
        this.httpMessage = httpMessage;
        this.serverURL = serverURL;
        this.data = data;
        this.response = response;
    }
}

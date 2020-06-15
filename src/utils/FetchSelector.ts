/**
 * fetch interface abstraction.
 * 
 * nodejs and web-based applications building on ConseilJS will likely have different
 * implementations of fetch available. This code allows ConseilJS use the appropriate version.
 */
export default class FetchSelector {
    static actualFetch: (url: string, options: any | undefined) => any;

    static setFetch(fetch: any) {
        this.actualFetch = fetch;
    }

    static fetch: (url: string, options: any | undefined) => any = (url: string, options: any | undefined) => FetchSelector.actualFetch(url, options);
}

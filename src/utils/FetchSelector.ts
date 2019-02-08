/**
 * fetch interface abstraction.
 * 
 * nodejs and web-based applications building on ConseilJS will likely have different
 * implementations of fetch available. This code allows ConseilJS use the appropriate version.
 */
export default class FetchSelector {
    static fetch: any = null;

    static setFetch(fetch: any) {
        this.fetch = fetch;
    }

    static getFetch() {
        return this.fetch;
    }
}

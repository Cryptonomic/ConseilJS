/**
 * Node/web compatibility for fetch.
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

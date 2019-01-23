export default class FetchInstance {
    static fetch: any = null;
    static setFetch(fetch: any) {
        this.fetch = fetch;
    }

    static getFetch() {
        return this.fetch;
    }
}
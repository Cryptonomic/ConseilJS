"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class FetchInstance {
    static setFetch(fetch) {
        this.fetch = fetch;
    }
    static getFetch() {
        return this.fetch;
    }
}
FetchInstance.fetch = null;
exports.default = FetchInstance;
//# sourceMappingURL=FetchInstance.js.map
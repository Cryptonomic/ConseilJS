"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class FetchSelector {
    static setFetch(fetch) {
        this.fetch = fetch;
    }
    static getFetch() {
        return this.fetch;
    }
}
FetchSelector.fetch = null;
exports.default = FetchSelector;
//# sourceMappingURL=FetchSelector.js.map
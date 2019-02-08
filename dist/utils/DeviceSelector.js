"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DeviceSelector {
    static setLedgerUtils(ledger) {
        this.ledgerUtils = ledger;
    }
    static getLedgerUtils() {
        return this.ledgerUtils;
    }
}
DeviceSelector.ledgerUtils = null;
exports.default = DeviceSelector;
//# sourceMappingURL=DeviceSelector.js.map
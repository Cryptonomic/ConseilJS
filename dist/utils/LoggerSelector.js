"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class LoggerSelector {
    static setLogger(log) {
        this.log = log;
    }
    static getLogger() {
        return this.log;
    }
    static setLevel(level) {
        this.log.setLevel(level, false);
    }
}
LoggerSelector.log = null;
exports.default = LoggerSelector;
//# sourceMappingURL=LoggerSelector.js.map
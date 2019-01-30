"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const FetchInstance_1 = __importDefault(require("./utils/FetchInstance"));
FetchInstance_1.default.setFetch(window.fetch);
__export(require("./tezos/TezosConseilQuery"));
__export(require("./tezos/TezosNodeQuery"));
__export(require("./tezos/TezosOperations"));
__export(require("./tezos/TezosWallet"));
//# sourceMappingURL=index-browser.js.map
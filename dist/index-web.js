"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const FetchSelector_1 = __importDefault(require("./utils/FetchSelector"));
FetchSelector_1.default.setFetch(window.fetch);
__export(require("./chain/tezos/TezosNodeQuery"));
__export(require("./chain/tezos/TezosOperations"));
__export(require("./identity/tezos/TezosWalletUtil"));
__export(require("./identity/tezos/TezosFileWallet"));
__export(require("./reporting/tezos/TezosConseilQuery"));
__export(require("./reporting/tezos/TezosConseilClient"));
//# sourceMappingURL=index-web.js.map
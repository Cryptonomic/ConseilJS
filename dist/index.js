"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fetch_1 = __importDefault(require("node-fetch"));
const FetchSelector_1 = __importDefault(require("./utils/FetchSelector"));
const DeviceUtils_1 = __importDefault(require("./utils/DeviceUtils"));
const TezosLedgerWallet = __importStar(require("./identity/tezos/TezosLedgerWallet"));
FetchSelector_1.default.setFetch(node_fetch_1.default);
DeviceUtils_1.default.setLedgerUtils(TezosLedgerWallet);
__export(require("./chain/tezos/TezosNodeQuery"));
__export(require("./chain/tezos/TezosOperations"));
__export(require("./identity/tezos/TezosFileWallet"));
__export(require("./identity/tezos/TezosLedgerWallet"));
__export(require("./identity/tezos/TezosWalletUtil"));
__export(require("./reporting/tezos/TezosConseilClient"));
__export(require("./reporting/tezos/TezosConseilQuery"));
__export(require("./reporting/ConseilMetadataClient"));
__export(require("./types/conseil/QueryTypes"));
//# sourceMappingURL=index.js.map
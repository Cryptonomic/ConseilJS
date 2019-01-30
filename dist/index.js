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
const FetchInstance_1 = __importDefault(require("./utils/FetchInstance"));
const DeviceUtils_1 = __importDefault(require("./utils/DeviceUtils"));
const LedgerUtils = __importStar(require("./utils/LedgerUtils"));
FetchInstance_1.default.setFetch(node_fetch_1.default);
DeviceUtils_1.default.setLedgerUtils(LedgerUtils);
__export(require("./tezos/TezosConseilQuery"));
__export(require("./tezos/TezosNodeQuery"));
__export(require("./tezos/TezosOperations"));
__export(require("./tezos/TezosWallet"));
__export(require("./tezos/TezosHardwareWallet"));
__export(require("./tezos/TezosConseilClient"));
//# sourceMappingURL=index.js.map
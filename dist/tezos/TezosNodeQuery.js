"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Nautilus = __importStar(require("../utils/NautilusQuery"));
var TezosNode;
(function (TezosNode) {
    function getBlock(server, hash) {
        return Nautilus.runGetQuery(server, `/chains/main/blocks/${hash}`)
            .then(json => { return json; });
    }
    TezosNode.getBlock = getBlock;
    function getBlockHead(server) {
        return getBlock(server, "head");
    }
    TezosNode.getBlockHead = getBlockHead;
    function getAccountForBlock(server, blockHash, accountID) {
        return Nautilus.runGetQuery(server, `/chains/main/blocks/${blockHash}/context/contracts/${accountID}`)
            .then(json => { return json; });
    }
    TezosNode.getAccountForBlock = getAccountForBlock;
    function getAccountManagerForBlock(server, blockHash, accountID) {
        return Nautilus.runGetQuery(server, `/chains/main/blocks/${blockHash}/context/contracts/${accountID}/manager_key`)
            .then(json => { return json; });
    }
    TezosNode.getAccountManagerForBlock = getAccountManagerForBlock;
    function forgeOperation(server, opGroup) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield Nautilus.runPostQuery(server, "/chains/main/blocks/head/helpers/forge/operations", opGroup);
            const forgedOperation = yield response.text();
            console.log('Forged operation:');
            console.log(forgedOperation);
            return forgedOperation
                .replace(/\n/g, '')
                .replace(/['"]+/g, '');
        });
    }
    TezosNode.forgeOperation = forgeOperation;
    function applyOperation(server, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield Nautilus.runPostQuery(server, `/chains/main/blocks/head/helpers/preapply/operations`, payload);
            const json = yield response.json();
            const appliedOperation = json;
            console.log('Applied operation:');
            console.log(JSON.stringify(appliedOperation));
            return appliedOperation;
        });
    }
    TezosNode.applyOperation = applyOperation;
    function injectOperation(server, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield Nautilus.runPostQuery(server, `injection/operation?chain=main`, payload);
            const injectedOperation = yield response.text();
            console.log('Injected operation');
            console.log(">>", injectedOperation);
            return injectedOperation;
        });
    }
    TezosNode.injectOperation = injectOperation;
})(TezosNode = exports.TezosNode || (exports.TezosNode = {}));
//# sourceMappingURL=TezosNodeQuery.js.map
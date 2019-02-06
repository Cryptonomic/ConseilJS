"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ErrorTypes_1 = require("../../types/conseil/ErrorTypes");
const FetchSelector_1 = __importDefault(require("../../utils/FetchSelector"));
const fetch = FetchSelector_1.default.getFetch();
var TezosNode;
(function (TezosNode) {
    function performGetRequest(server, command) {
        const url = `${server}/${command}`;
        return fetch(url, { method: 'get' })
            .then(response => {
            if (!response.ok) {
                throw new ErrorTypes_1.ServiceRequestError(response.status, response.statusText, url, null);
            }
            return response;
        })
            .then(response => {
            try {
                return response.json();
            }
            catch (_a) {
                throw new ErrorTypes_1.ServiceResponseError(response.status, response.statusText, url, null, response);
            }
        });
    }
    function performPostRequest(server, command, payload = {}) {
        const url = `${server}/${command}`;
        const payloadStr = JSON.stringify(payload);
        return fetch(url, { method: 'post', body: payloadStr, headers: { 'content-type': 'application/json' } });
    }
    function getBlock(server, hash) {
        return performGetRequest(server, `chains/main/blocks/${hash}`)
            .then(json => { return json; });
    }
    TezosNode.getBlock = getBlock;
    function getBlockHead(server) {
        return getBlock(server, "head");
    }
    TezosNode.getBlockHead = getBlockHead;
    function getAccountForBlock(server, blockHash, accountID) {
        return performGetRequest(server, `chains/main/blocks/${blockHash}/context/contracts/${accountID}`)
            .then(json => json);
    }
    TezosNode.getAccountForBlock = getAccountForBlock;
    function getAccountManagerForBlock(server, blockHash, accountID) {
        return performGetRequest(server, `chains/main/blocks/${blockHash}/context/contracts/${accountID}/manager_key`)
            .then(json => json);
    }
    TezosNode.getAccountManagerForBlock = getAccountManagerForBlock;
    function forgeOperation(server, opGroup) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield performPostRequest(server, "chains/main/blocks/head/helpers/forge/operations", opGroup);
            const forgedOperation = yield response.text();
            return forgedOperation.replace(/\n/g, '').replace(/['"]+/g, '');
        });
    }
    TezosNode.forgeOperation = forgeOperation;
    function applyOperation(server, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield performPostRequest(server, 'chains/main/blocks/head/helpers/preapply/operations', payload);
            const json = yield response.json();
            const appliedOperation = json;
            return appliedOperation;
        });
    }
    TezosNode.applyOperation = applyOperation;
    function injectOperation(server, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield performPostRequest(server, 'injection/operation?chain=main', payload);
            const injectedOperation = yield response.text();
            return injectedOperation;
        });
    }
    TezosNode.injectOperation = injectOperation;
})(TezosNode = exports.TezosNode || (exports.TezosNode = {}));
//# sourceMappingURL=TezosNodeQuery.js.map
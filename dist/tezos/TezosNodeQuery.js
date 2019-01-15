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
/**
 * Utility functions for interacting with the Tezos node.
 */
var TezosNode;
(function (TezosNode) {
    /**
     * Gets a given block.
     * @param {string} server  Which Tezos node to go against
     * @param {String} hash Hash of the given block
     * @returns {Promise<BlockMetadata>}    Block
     */
    function getBlock(server, hash) {
        return Nautilus.runGetQuery(server, `/chains/main/blocks/${hash}`)
            .then(json => { return json; });
    }
    TezosNode.getBlock = getBlock;
    /**
     * Gets the block head.
     * @param {string} server  Which Tezos node to go against
     * @returns {Promise<BlockMetadata>}    Block head
     */
    function getBlockHead(server) {
        return getBlock(server, "head");
    }
    TezosNode.getBlockHead = getBlockHead;
    /**
     * Fetches a specific account for a given block.
     * @param {string} server  Which Tezos node to go against
     * @param {string} blockHash    Hash of given block
     * @param {string} accountID    Account ID
     * @returns {Promise<Account>}  The account
     */
    function getAccountForBlock(server, blockHash, accountID) {
        return Nautilus.runGetQuery(server, `/chains/main/blocks/${blockHash}/context/contracts/${accountID}`)
            .then(json => { return json; });
    }
    TezosNode.getAccountForBlock = getAccountForBlock;
    /**
     * Fetches the manager of a specific account for a given block.
     * @param {string} server  Which Tezos node to go against
     * @param {string} blockHash    Hash of given block
     * @param {string} accountID    Account ID
     * @returns {Promise<ManagerKey>}   The account
     */
    function getAccountManagerForBlock(server, blockHash, accountID) {
        return Nautilus.runGetQuery(server, `/chains/main/blocks/${blockHash}/context/contracts/${accountID}/manager_key`)
            .then(json => { return json; });
    }
    TezosNode.getAccountManagerForBlock = getAccountManagerForBlock;
    /**
     * Forge an operation group using the Tezos RPC client.
     * @param {string} server  Which Tezos node to go against
     * @param {object} opGroup  Operation group payload
     * @returns {Promise<string>}  Forged operation
     */
    function forgeOperation(server, opGroup) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield Nautilus.runPostQuery(server, "/chains/main/blocks/head/helpers/forge/operations", opGroup);
            const forgedOperation = yield response.text();
            console.log('Forged operation:');
            console.log(forgedOperation);
            return forgedOperation
                .replace(/\n/g, '')
                //.replace('\"', '')
                .replace(/['"]+/g, '');
        });
    }
    TezosNode.forgeOperation = forgeOperation;
    /**
     * Applies an operation using the Tezos RPC client.
     * @param {string} server  Which Tezos node to go against
     * @param {object} payload  Payload set according to protocol spec
     * @returns {Promise<AppliedOperation>} Applied operation
     */
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
    /**
     *
     * @param {string} server  Which Tezos node to go against
     * @param {object} payload  Payload set according to protocol spec
     * @returns {Promise<InjectedOperation>} Injected operation
     */
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
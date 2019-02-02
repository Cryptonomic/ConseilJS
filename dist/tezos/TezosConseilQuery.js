"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ConseilQuery_1 = require("../utils/ConseilQuery");
var TezosConseilQuery;
(function (TezosConseilQuery) {
    function getEmptyTezosFilter() {
        return {
            block_id: [],
            block_level: [],
            block_netid: [],
            block_protocol: [],
            operation_id: [],
            operation_source: [],
            operation_destination: [],
            operation_participant: [],
            operation_kind: [],
            account_id: [],
            account_manager: [],
            account_delegate: [],
            limit: 100
        };
    }
    TezosConseilQuery.getEmptyTezosFilter = getEmptyTezosFilter;
    function getBlockHead(server, apiKey) {
        return ConseilQuery_1.queryConseilServer(server, 'blocks/head', apiKey)
            .then(json => json);
    }
    TezosConseilQuery.getBlockHead = getBlockHead;
    function getBlock(server, hash, apiKey) {
        return ConseilQuery_1.queryConseilServer(server, `blocks/${hash}`, apiKey)
            .then(json => json);
    }
    TezosConseilQuery.getBlock = getBlock;
    function getOperationGroup(server, hash, apiKey) {
        return ConseilQuery_1.queryConseilServer(server, `operation_groups/${hash}`, apiKey)
            .then(json => json);
    }
    TezosConseilQuery.getOperationGroup = getOperationGroup;
    function getOperationGroups(server, filter, apiKey) {
        return ConseilQuery_1.queryConseilServerWithFilter(server, 'operation_groups', filter, apiKey)
            .then(json => json);
    }
    TezosConseilQuery.getOperationGroups = getOperationGroups;
    function getOperations(server, filter, apiKey) {
        return ConseilQuery_1.queryConseilServerWithFilter(server, 'operations', filter, apiKey)
            .then(json => json);
    }
    TezosConseilQuery.getOperations = getOperations;
    function getAverageFees(server, filter, apiKey) {
        return ConseilQuery_1.queryConseilServerWithFilter(server, 'operations/avgFees', filter, apiKey)
            .then(json => json);
    }
    TezosConseilQuery.getAverageFees = getAverageFees;
    function getAccount(server, hash, apiKey) {
        return ConseilQuery_1.queryConseilServer(server, `accounts/${hash}`, apiKey)
            .then(json => json);
    }
    TezosConseilQuery.getAccount = getAccount;
    function getBlocks(server, filter, apiKey) {
        return ConseilQuery_1.queryConseilServerWithFilter(server, 'blocks', filter, apiKey)
            .then(json => json);
    }
    TezosConseilQuery.getBlocks = getBlocks;
    function getAccounts(server, filter, apiKey) {
        return ConseilQuery_1.queryConseilServerWithFilter(server, 'accounts', filter, apiKey)
            .then(json => json);
    }
    TezosConseilQuery.getAccounts = getAccounts;
})(TezosConseilQuery = exports.TezosConseilQuery || (exports.TezosConseilQuery = {}));
//# sourceMappingURL=TezosConseilQuery.js.map
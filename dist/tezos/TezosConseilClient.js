"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const ConseilQuery_1 = require("../utils/v2/ConseilQuery");
const QueryTypes_1 = require("../utils/v2/QueryTypes");
const ConseilDataClient_1 = require("../utils/v2/ConseilDataClient");
var TezosConseilClient;
(function (TezosConseilClient) {
    const BLOCKS = 'blocks';
    const ACCOUNTS = 'accounts';
    const OPERATION_GROUPS = 'operation_groups';
    const OPERATIONS = 'operations';
    function getTezosEntityData(serverInfo, network, entity, query) {
        return __awaiter(this, void 0, void 0, function* () {
            return ConseilDataClient_1.ConseilDataClient.executeEntityQuery(serverInfo, 'tezos', network, entity, query);
        });
    }
    TezosConseilClient.getTezosEntityData = getTezosEntityData;
    function getBlockHead(serverInfo, network) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = ConseilQuery_1.ConseilQueryBuilder.setLimit(ConseilQuery_1.ConseilQueryBuilder.addOrdering(ConseilQuery_1.ConseilQueryBuilder.blankQuery(), 'level', QueryTypes_1.ConseilSortDirection.DESC), 1);
            return getTezosEntityData(serverInfo, network, BLOCKS, query);
        });
    }
    TezosConseilClient.getBlockHead = getBlockHead;
    function getBlock(serverInfo, network, hash) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = ConseilQuery_1.ConseilQueryBuilder.setLimit(ConseilQuery_1.ConseilQueryBuilder.addPredicate(ConseilQuery_1.ConseilQueryBuilder.blankQuery(), 'hash', QueryTypes_1.ConseilOperator.EQ, [hash], false), 1);
            return getTezosEntityData(serverInfo, network, BLOCKS, query);
        });
    }
    TezosConseilClient.getBlock = getBlock;
    function getAccount(serverInfo, network, accountID) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = ConseilQuery_1.ConseilQueryBuilder.setLimit(ConseilQuery_1.ConseilQueryBuilder.addPredicate(ConseilQuery_1.ConseilQueryBuilder.blankQuery(), 'account_id', QueryTypes_1.ConseilOperator.EQ, [accountID], false), 1);
            return getTezosEntityData(serverInfo, network, ACCOUNTS, query);
        });
    }
    TezosConseilClient.getAccount = getAccount;
    function getOperationGroup(serverInfo, network, operationGroupID) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = ConseilQuery_1.ConseilQueryBuilder.setLimit(ConseilQuery_1.ConseilQueryBuilder.addPredicate(ConseilQuery_1.ConseilQueryBuilder.blankQuery(), 'operation_id', QueryTypes_1.ConseilOperator.EQ, [operationGroupID], false), 1);
            return getTezosEntityData(serverInfo, network, OPERATION_GROUPS, query);
        });
    }
    TezosConseilClient.getOperationGroup = getOperationGroup;
    function getBlocks(serverInfo, network, query) {
        return __awaiter(this, void 0, void 0, function* () {
            return getTezosEntityData(serverInfo, network, BLOCKS, query);
        });
    }
    TezosConseilClient.getBlocks = getBlocks;
    function getAccounts(serverInfo, network, query) {
        return __awaiter(this, void 0, void 0, function* () {
            return getTezosEntityData(serverInfo, network, ACCOUNTS, query);
        });
    }
    TezosConseilClient.getAccounts = getAccounts;
    function getOperationGroups(serverInfo, network, query) {
        return __awaiter(this, void 0, void 0, function* () {
            return getTezosEntityData(serverInfo, network, OPERATION_GROUPS, query);
        });
    }
    TezosConseilClient.getOperationGroups = getOperationGroups;
    function getOperations(serverInfo, network, query) {
        return __awaiter(this, void 0, void 0, function* () {
            return getTezosEntityData(serverInfo, network, OPERATIONS, query);
        });
    }
    TezosConseilClient.getOperations = getOperations;
})(TezosConseilClient = exports.TezosConseilClient || (exports.TezosConseilClient = {}));
//# sourceMappingURL=TezosConseilClient.js.map
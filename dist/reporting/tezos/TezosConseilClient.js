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
const ConseilQueryBuilder_1 = require("../ConseilQueryBuilder");
const QueryTypes_1 = require("../../types/conseil/QueryTypes");
const ConseilDataClient_1 = require("../ConseilDataClient");
var TezosConseilClient;
(function (TezosConseilClient) {
    const BLOCKS = 'blocks';
    const ACCOUNTS = 'accounts';
    const OPERATION_GROUPS = 'operation_groups';
    const OPERATIONS = 'operations';
    const FEES = 'fees';
    const PROPOSALS = 'proposals';
    const BAKERS = 'bakers';
    const BALLOTS = 'ballots';
    function getTezosEntityData(serverInfo, network, entity, query) {
        return __awaiter(this, void 0, void 0, function* () {
            return ConseilDataClient_1.ConseilDataClient.executeEntityQuery(serverInfo, 'tezos', network, entity, query);
        });
    }
    TezosConseilClient.getTezosEntityData = getTezosEntityData;
    function getBlockHead(serverInfo, network) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = ConseilQueryBuilder_1.ConseilQueryBuilder.setLimit(ConseilQueryBuilder_1.ConseilQueryBuilder.addOrdering(ConseilQueryBuilder_1.ConseilQueryBuilder.blankQuery(), 'level', QueryTypes_1.ConseilSortDirection.DESC), 1);
            const r = yield getTezosEntityData(serverInfo, network, BLOCKS, query);
            return r[0];
        });
    }
    TezosConseilClient.getBlockHead = getBlockHead;
    function getBlock(serverInfo, network, hash) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = ConseilQueryBuilder_1.ConseilQueryBuilder.setLimit(ConseilQueryBuilder_1.ConseilQueryBuilder.addPredicate(ConseilQueryBuilder_1.ConseilQueryBuilder.blankQuery(), 'hash', QueryTypes_1.ConseilOperator.EQ, [hash], false), 1);
            return getTezosEntityData(serverInfo, network, BLOCKS, query);
        });
    }
    TezosConseilClient.getBlock = getBlock;
    function getBlockByLevel(serverInfo, network, level) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = ConseilQueryBuilder_1.ConseilQueryBuilder.setLimit(ConseilQueryBuilder_1.ConseilQueryBuilder.addPredicate(ConseilQueryBuilder_1.ConseilQueryBuilder.blankQuery(), 'level', QueryTypes_1.ConseilOperator.EQ, [level], false), 1);
            return getTezosEntityData(serverInfo, network, BLOCKS, query);
        });
    }
    TezosConseilClient.getBlockByLevel = getBlockByLevel;
    function getAccount(serverInfo, network, accountID) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = ConseilQueryBuilder_1.ConseilQueryBuilder.setLimit(ConseilQueryBuilder_1.ConseilQueryBuilder.addPredicate(ConseilQueryBuilder_1.ConseilQueryBuilder.blankQuery(), 'account_id', QueryTypes_1.ConseilOperator.EQ, [accountID], false), 1);
            return getTezosEntityData(serverInfo, network, ACCOUNTS, query);
        });
    }
    TezosConseilClient.getAccount = getAccount;
    function getOperationGroup(serverInfo, network, operationGroupID) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = ConseilQueryBuilder_1.ConseilQueryBuilder.setLimit(ConseilQueryBuilder_1.ConseilQueryBuilder.addPredicate(ConseilQueryBuilder_1.ConseilQueryBuilder.blankQuery(), 'operation_id', QueryTypes_1.ConseilOperator.EQ, [operationGroupID], false), 1);
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
    function getFeeStatistics(serverInfo, network, operationType) {
        return __awaiter(this, void 0, void 0, function* () {
            let query = ConseilQueryBuilder_1.ConseilQueryBuilder.blankQuery();
            query = ConseilQueryBuilder_1.ConseilQueryBuilder.addPredicate(query, 'kind', QueryTypes_1.ConseilOperator.EQ, [operationType]);
            query = ConseilQueryBuilder_1.ConseilQueryBuilder.addOrdering(query, 'timestamp', QueryTypes_1.ConseilSortDirection.DESC);
            query = ConseilQueryBuilder_1.ConseilQueryBuilder.setLimit(query, 1);
            return getTezosEntityData(serverInfo, network, FEES, query);
        });
    }
    TezosConseilClient.getFeeStatistics = getFeeStatistics;
    function getProposals(serverInfo, network, query) {
        return __awaiter(this, void 0, void 0, function* () {
            return getTezosEntityData(serverInfo, network, PROPOSALS, query);
        });
    }
    TezosConseilClient.getProposals = getProposals;
    function getBakers(serverInfo, network, query) {
        return __awaiter(this, void 0, void 0, function* () {
            return getTezosEntityData(serverInfo, network, BAKERS, query);
        });
    }
    TezosConseilClient.getBakers = getBakers;
    function getBallots(serverInfo, network, query) {
        return __awaiter(this, void 0, void 0, function* () {
            return getTezosEntityData(serverInfo, network, BALLOTS, query);
        });
    }
    TezosConseilClient.getBallots = getBallots;
    function awaitOperationConfirmation(serverInfo, network, hash, duration) {
        return __awaiter(this, void 0, void 0, function* () {
            if (duration <= 0) {
                throw new Error('Invalid duration');
            }
            const initialLevel = (yield getBlockHead(serverInfo, network))[0]['level'];
            let currentLevel = initialLevel;
            const query = ConseilQueryBuilder_1.ConseilQueryBuilder.setLimit(ConseilQueryBuilder_1.ConseilQueryBuilder.addPredicate(ConseilQueryBuilder_1.ConseilQueryBuilder.blankQuery(), 'operation_group_hash', QueryTypes_1.ConseilOperator.EQ, [hash], false), 1);
            while (initialLevel + duration > currentLevel) {
                const group = yield getTezosEntityData(serverInfo, network, OPERATIONS, query);
                if (group.length > 0) {
                    return group;
                }
                currentLevel = (yield getBlockHead(serverInfo, network))[0]['level'];
                if (initialLevel + duration < currentLevel) {
                    break;
                }
                yield new Promise(resolve => setTimeout(resolve, 60 * 1000));
            }
            throw new Error(`Did not observe ${hash} on ${network} in ${duration} block${duration > 1 ? 's' : ''} since ${initialLevel}`);
        });
    }
    TezosConseilClient.awaitOperationConfirmation = awaitOperationConfirmation;
    function awaitOperationForkConfirmation(serverInfo, network, hash, duration, depth) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('Not implemented');
        });
    }
    TezosConseilClient.awaitOperationForkConfirmation = awaitOperationForkConfirmation;
    function getEntityQueryForId(id) {
        let q = ConseilQueryBuilder_1.ConseilQueryBuilder.setLimit(ConseilQueryBuilder_1.ConseilQueryBuilder.blankQuery(), 1);
        if (typeof (id) === 'number') {
            const n = Number(id);
            if (n < 0) {
                throw new Error('Invalid numeric id parameter');
            }
            return { entity: BLOCKS, query: ConseilQueryBuilder_1.ConseilQueryBuilder.addPredicate(q, 'level', QueryTypes_1.ConseilOperator.EQ, [id], false) };
        }
        else if (typeof (id) === 'string') {
            const s = String(id);
            if (s.startsWith('tz1') || s.startsWith('tz2') || s.startsWith('tz3') || s.startsWith('KT1')) {
                return { entity: ACCOUNTS, query: ConseilQueryBuilder_1.ConseilQueryBuilder.addPredicate(q, 'account_id', QueryTypes_1.ConseilOperator.EQ, [id], false) };
            }
            else if (s.startsWith('B')) {
                return { entity: BLOCKS, query: ConseilQueryBuilder_1.ConseilQueryBuilder.addPredicate(q, 'hash', QueryTypes_1.ConseilOperator.EQ, [id], false) };
            }
            else if (s.startsWith('o')) {
                return { entity: OPERATION_GROUPS, query: ConseilQueryBuilder_1.ConseilQueryBuilder.addPredicate(q, 'operation_id', QueryTypes_1.ConseilOperator.EQ, [id], false) };
            }
        }
        throw new Error('Invalid id parameter');
    }
    TezosConseilClient.getEntityQueryForId = getEntityQueryForId;
})(TezosConseilClient = exports.TezosConseilClient || (exports.TezosConseilClient = {}));
//# sourceMappingURL=TezosConseilClient.js.map
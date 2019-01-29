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
const ConseilDataClient_1 = require("../utils/v2/ConseilDataClient");
/**
 * Functions for querying the Conseil backend REST API v2
 */
var TezosConseilClient;
(function (TezosConseilClient) {
    const BLOCKS = 'blocks';
    const ACCOUNTS = 'accounts';
    const OPERATION_GROUPS = 'operation_groups';
    const OPERATIONS = 'operations';
    /**
     * Returns a record set for a specific entity of the Tezos platform. Entity list and metadata can be retrieved using ConseilMetadataClient.
     *
     * @param serverInfo Conseil server connection definition.
     * @param network Tezos network to query, mainnet, alphanet, etc.
     * @param entity Entity to retrieve.
     * @param query Query to submit.
     */
    function getTezosEntityData(serverInfo, network, entity, query) {
        return __awaiter(this, void 0, void 0, function* () {
            return ConseilDataClient_1.ConseilDataClient.executeEntityQuery(serverInfo, 'tezos', network, entity, query);
        });
    }
    TezosConseilClient.getTezosEntityData = getTezosEntityData;
    /**
     * Get the head block from the Tezos platform given a network.
     *
     * @param serverInfo Conseil server connection definition.
     * @param network Tezos network to query, mainnet, alphanet, etc.
     */
    function getBlockHead(serverInfo, network) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = ConseilQuery_1.ConseilQueryBuilder.setLimit(ConseilQuery_1.ConseilQueryBuilder.addOrdering(ConseilQuery_1.ConseilQueryBuilder.blankQuery(), 'level', ConseilQuery_1.ConseilSortDirection.DESC), 1);
            return getTezosEntityData(serverInfo, network, BLOCKS, query);
        });
    }
    TezosConseilClient.getBlockHead = getBlockHead;
    /**
     * Get a block by hash from the Tezos platform given a network.
     *
     * @param serverInfo Conseil server connection definition.
     * @param network Tezos network to query, mainnet, alphanet, etc.
     * @param hash Block hash to query for.
     */
    function getBlock(serverInfo, network, hash) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = ConseilQuery_1.ConseilQueryBuilder.setLimit(ConseilQuery_1.ConseilQueryBuilder.addPredicate(ConseilQuery_1.ConseilQueryBuilder.blankQuery(), 'hash', ConseilQuery_1.ConseilOperator.EQ, [hash], false), 1);
            return getTezosEntityData(serverInfo, network, BLOCKS, query);
        });
    }
    TezosConseilClient.getBlock = getBlock;
    /**
     * Get an account from the Tezos platform given a network by account id.
     *
     * @param serverInfo Conseil server connection definition.
     * @param network Tezos network to query, mainnet, alphanet, etc.
     * @param accountID Account hash to query for.
     */
    function getAccount(serverInfo, network, accountID) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = ConseilQuery_1.ConseilQueryBuilder.setLimit(ConseilQuery_1.ConseilQueryBuilder.addPredicate(ConseilQuery_1.ConseilQueryBuilder.blankQuery(), 'account_id', ConseilQuery_1.ConseilOperator.EQ, [accountID], false), 1);
            return getTezosEntityData(serverInfo, network, ACCOUNTS, query);
        });
    }
    TezosConseilClient.getAccount = getAccount;
    /**
     * Get an operation group from the Tezos platform given a network by id.
     *
     * @param serverInfo Conseil server connection definition.
     * @param network Tezos network to query, mainnet, alphanet, etc.
     * @param operationGroupID Operation group hash to query for.
     */
    function getOperationGroup(serverInfo, network, operationGroupID) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = ConseilQuery_1.ConseilQueryBuilder.setLimit(ConseilQuery_1.ConseilQueryBuilder.addPredicate(ConseilQuery_1.ConseilQueryBuilder.blankQuery(), 'operation_id', ConseilQuery_1.ConseilOperator.EQ, [operationGroupID], false), 1);
            return getTezosEntityData(serverInfo, network, OPERATION_GROUPS, query);
        });
    }
    TezosConseilClient.getOperationGroup = getOperationGroup;
    /**
     * Request block-entity data for a given network. Rather than simply requesting a block by hash, this function allows modification of the response to contain a subset of block attributes subject to a filter on some of them.
     *
     * @param serverInfo Conseil server connection definition.
     * @param network Tezos network to query, mainnet, alphanet, etc.
     * @param query Conseil JSON query. See reference.
     *
     * @see [Conseil Query Format Spec]{@link https://github.com/Cryptonomic/Conseil/blob/master/doc/Query.md}
     */
    function getBlocks(serverInfo, network, query) {
        return __awaiter(this, void 0, void 0, function* () {
            return getTezosEntityData(serverInfo, network, BLOCKS, query);
        });
    }
    TezosConseilClient.getBlocks = getBlocks;
    /**
     * Request account-entity data for a given network. Rather than simply requesting an account by hash, this function allows modification of the response to contain a subset of account attributes subject to a filter on some of them.
     *
     * @param serverInfo Conseil server connection definition.
     * @param network Tezos network to query, mainnet, alphanet, etc.
     * @param query Conseil JSON query. See reference.
     *
     * @see [Conseil Query Format Spec]{@link https://github.com/Cryptonomic/Conseil/blob/master/doc/Query.md}
     */
    function getAccounts(serverInfo, network, query) {
        return __awaiter(this, void 0, void 0, function* () {
            return getTezosEntityData(serverInfo, network, ACCOUNTS, query);
        });
    }
    TezosConseilClient.getAccounts = getAccounts;
    /**
     * Request operation group-entity data for a given network. Rather than simply requesting an operation group by hash, this function allows modification of the response to contain a subset of operation group attributes subject to a filter on some of them.
     *
     * @param serverInfo Conseil server connection definition.
     * @param network Tezos network to query, mainnet, alphanet, etc.
     * @param query Conseil JSON query. See reference.
     *
     * @see [Conseil Query Format Spec]{@link https://github.com/Cryptonomic/Conseil/blob/master/doc/Query.md}
     */
    function getOperationGroups(serverInfo, network, query) {
        return __awaiter(this, void 0, void 0, function* () {
            return getTezosEntityData(serverInfo, network, OPERATION_GROUPS, query);
        });
    }
    TezosConseilClient.getOperationGroups = getOperationGroups;
    /**
     * Request operation-entity data for a given network. This function allows modification of the response to contain a subset of operation attributes subject to a filter on some of them.
     *
     * @param serverInfo Conseil server connection definition.
     * @param network Tezos network to query, mainnet, alphanet, etc.
     * @param query Conseil JSON query. See reference.
     *
     * @see [Conseil Query Format Spec]{@link https://github.com/Cryptonomic/Conseil/blob/master/doc/Query.md}
     */
    function getOperations(serverInfo, network, query) {
        return __awaiter(this, void 0, void 0, function* () {
            return getTezosEntityData(serverInfo, network, OPERATIONS, query);
        });
    }
    TezosConseilClient.getOperations = getOperations;
})(TezosConseilClient = exports.TezosConseilClient || (exports.TezosConseilClient = {}));
//# sourceMappingURL=TezosConseilClient.js.map
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
class TezosConseilClient extends ConseilDataClient_1.ConseilDataClient {
    constructor() {
        super(...arguments);
        this.BLOCKS = 'blocks';
        this.ACCOUNTS = 'accounts';
        this.OPERATION_GROUPS = 'operation_groups';
        this.OPERATIONS = 'operations';
    }
    /**
     * Returns a record set for a specific entity of the Tezos platform. Entity list and metadata can be retrieved using ConseilMetadataClient.
     *
     * @param serverInfo Conseil server connection definition.
     * @param network Tezos network to query, mainnet, alphanet, etc.
     * @param entity Entity to retrieve.
     * @param filter Filter to apply.
     */
    getTezosEntityData(serverInfo, network, entity, query) {
        const _super = name => super[name];
        return __awaiter(this, void 0, void 0, function* () {
            return _super("executeEntityQuery").call(this, serverInfo, 'tezos', network, entity, query);
        });
    }
    /**
     * Get the head block from the Tezos platform given a network.
     *
     * @param serverInfo Conseil server connection definition.
     * @param network Tezos network to query, mainnet, alphanet, etc.
     */
    getBlockHead(serverInfo, network) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = new ConseilQuery_1.ConseilQuery().setOrdering('level', ConseilQuery_1.ConseilSortDirection.DESC).setLimit(1);
            return this.getTezosEntityData(serverInfo, network, this.BLOCKS, query);
        });
    }
    getBlock(serverInfo, network, hash) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = new ConseilQuery_1.ConseilQuery().addPredicate('hash', ConseilQuery_1.ConseilOperator.EQ, [hash], false).setLimit(1);
            return this.getTezosEntityData(serverInfo, network, this.BLOCKS, query);
        });
    }
    getAccount(serverInfo, network, accountID) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = new ConseilQuery_1.ConseilQuery().addPredicate('account_id', ConseilQuery_1.ConseilOperator.EQ, [accountID], false).setLimit(1);
            return this.getTezosEntityData(serverInfo, network, this.ACCOUNTS, query);
        });
    }
    getOperationGroup(serverInfo, network, operationGroupID) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = new ConseilQuery_1.ConseilQuery().addPredicate('operation_id', ConseilQuery_1.ConseilOperator.EQ, [operationGroupID], false).setLimit(1);
            return this.getTezosEntityData(serverInfo, network, this.OPERATION_GROUPS, query);
        });
    }
    getBlocks(serverInfo, network, query) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.getTezosEntityData(serverInfo, network, this.BLOCKS, query);
        });
    }
    getAccounts(serverInfo, network, query) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.getTezosEntityData(serverInfo, network, this.ACCOUNTS, query);
        });
    }
    getOperationGroups(serverInfo, network, query) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.getTezosEntityData(serverInfo, network, this.OPERATION_GROUPS, query);
        });
    }
    getOperations(serverInfo, network, query) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.getTezosEntityData(serverInfo, network, this.OPERATIONS, query);
        });
    }
}
exports.TezosConseilClient = TezosConseilClient;
//# sourceMappingURL=TezosConseilClient.js.map
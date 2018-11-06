"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ConseilQuery_1 = require("../utils/ConseilQuery");
var TezosConseilQuery;
(function (TezosConseilQuery) {
    /**
     * Convenience function for creating an empty Tezos filter which can later be overriden as desired.
     * @returns {TezosFilter}   Empty Tezos filter
     */
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
    /**
     * Fetches the most recent block stored in the database.
     * @param {string} server  Which Conseil server to go against
     * @param apiKey    API key to use for Conseil server.
     * @returns {Promise<TezosBlock>}   Latest block.
     */
    function getBlockHead(server, apiKey) {
        return ConseilQuery_1.queryConseilServer(server, 'blocks/head', apiKey)
            .then(json => {
            return json;
        });
    }
    TezosConseilQuery.getBlockHead = getBlockHead;
    /**
     * Fetches a block by block hash from the db.
     * @param {string} server  Which Conseil server to go against
     * @param {String} hash The block's hash
     * @param apiKey    API key to use for Conseil server.
     * @returns {Promise<TezosBlock>}   The block
     */
    function getBlock(server, hash, apiKey) {
        return ConseilQuery_1.queryConseilServer(server, `blocks/${hash}`, apiKey)
            .then(json => {
            return json;
        });
    }
    TezosConseilQuery.getBlock = getBlock;
    /**
     * Fetch a given operation group
     * @param {string} server  Which Conseil server to go against
     * @param {String} hash Operation group hash
     * @param apiKey    API key to use for Conseil server.
     * @returns {Promise<TezosOperationGroupWithOperations>}    Operation group along with associated operations and accounts
     */
    function getOperationGroup(server, hash, apiKey) {
        return ConseilQuery_1.queryConseilServer(server, `operation_groups/${hash}`, apiKey)
            .then(json => {
            return json;
        });
    }
    TezosConseilQuery.getOperationGroup = getOperationGroup;
    /**
     * Fetches all operation groups.
     * @param {string} server  Which Conseil server to go against
     * @param {TezosFilter} filter  Filters to apply
     * @param apiKey    API key to use for Conseil server.
     * @returns {Promise<TezosOperationGroup[]>}    List of operation groups
     */
    function getOperationGroups(server, filter, apiKey) {
        return ConseilQuery_1.queryConseilServerWithFilter(server, 'operation_groups', filter, apiKey)
            .then(json => {
            return json;
        });
    }
    TezosConseilQuery.getOperationGroups = getOperationGroups;
    /**
     * Fetches all operations.
     * @param {string} server  Which Conseil server to go against
     * @param {TezosFilter} filter  Filters to apply
     * @param apiKey    API key to use for Conseil server.
     * @returns {Promise<TezosOperationGroup[]>}    List of operations
     */
    function getOperations(server, filter, apiKey) {
        return ConseilQuery_1.queryConseilServerWithFilter(server, 'operations', filter, apiKey)
            .then(json => {
            return json;
        });
    }
    TezosConseilQuery.getOperations = getOperations;
    /**
     * Fetches prevailing fees.
     * @param {string} server  Which Conseil server to go against
     * @param {TezosFilter} filter  Filters to apply. 'operation_kind' and 'limit' should be explicitly set for maximum accuracy.
     * @param apiKey    API key to use for Conseil server.
     * @returns {Promise<TezosOperationGroup[]>}    Low, medium and high fee levels.
     */
    function getAverageFees(server, filter, apiKey) {
        return ConseilQuery_1.queryConseilServerWithFilter(server, 'operations/avgFees', filter, apiKey)
            .then(json => {
            return json;
        });
    }
    TezosConseilQuery.getAverageFees = getAverageFees;
    /**
     * Fetches an account by account id from the db.
     * @param {string} server  Which Conseil server to go against
     * @param {String} hash The account's id number
     * @param apiKey    API key to use for Conseil server.
     * @returns {Promise<TezosAccountWithOperationGroups>}  The account with its associated operation groups
     */
    function getAccount(server, hash, apiKey) {
        return ConseilQuery_1.queryConseilServer(server, `accounts/${hash}`, apiKey)
            .then(json => {
            return json;
        });
    }
    TezosConseilQuery.getAccount = getAccount;
    /**
     * Fetches all blocks from the db.
     * @param {string} server  Which Conseil server to go against
     * @param {TezosFilter} filter  Filters to apply
     * @param apiKey    API key to use for Conseil server.
     * @returns {Promise<TezosBlock[]>} List of blocks
     */
    function getBlocks(server, filter, apiKey) {
        return ConseilQuery_1.queryConseilServerWithFilter(server, 'blocks', filter, apiKey)
            .then(json => {
            return json;
        });
    }
    TezosConseilQuery.getBlocks = getBlocks;
    /**
     * Fetches a list of accounts from the db.
     * @param {string} server  Which Tezos network to go against
     * @param {TezosFilter} filter  Filters to apply
     * @param apiKey    API key to use for Conseil server.
     * @returns {Promise<TezosAccount[]>}   List of accounts
     */
    function getAccounts(server, filter, apiKey) {
        return ConseilQuery_1.queryConseilServerWithFilter(server, 'accounts', filter, apiKey)
            .then(json => {
            return json;
        });
    }
    TezosConseilQuery.getAccounts = getAccounts;
})(TezosConseilQuery = exports.TezosConseilQuery || (exports.TezosConseilQuery = {}));
//# sourceMappingURL=TezosConseilQuery.js.map
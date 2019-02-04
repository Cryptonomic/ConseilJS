import {
    OperationFees,
    TezosAccount,
    TezosAccountWithOperationGroups,
    TezosBlock, TezosBlockWithOperationGroups, TezosOperation,
    TezosOperationGroup,
    TezosOperationGroupWithOperations
} from "../types/conseil/ConseilTezosTypes";
import {queryConseilServer, queryConseilServerWithFilter} from "../utils/ConseilQuery";

/**
 * Functions for querying the Conseil backend REST API
 */

/**
 * Filter with predicates for querying Conseil server
 * See Conseil REST API documentation for usage.
 *
 * @deprecated since beta 2.0
 */
export interface TezosFilter {
    limit: number;
    block_id: string[];
    block_level: number[];
    block_netid: string[];
    block_protocol: string[];
    operation_id: string[];
    operation_source: string[];
    operation_destination: string[];
    operation_participant: string[];
    operation_kind: string[];
    account_id: string[];
    account_manager: string[];
    account_delegate: string[];
}

export namespace TezosConseilQuery {
    /**
     * Convenience function for creating an empty Tezos filter which can later be overriden as desired.
     * 
     * @returns {TezosFilter} Empty Tezos filter
     * 
     * @deprecated since beta 2.0
     */
    export function getEmptyTezosFilter(): TezosFilter {
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
        }
    }

    /**
     * Fetches the most recent block stored in the database.
     * 
     * @param {string} server Which Conseil server to go against
     * @param apiKey API key to use for Conseil server.
     * @returns {Promise<TezosBlock>} Latest block.
     * 
     * @deprecated since beta 2.0
     */
    export function getBlockHead(server: string, apiKey: string): Promise<TezosBlock> {
        return queryConseilServer(server, 'blocks/head', apiKey)
            .then(json => json as TezosBlock);
    }

    /**
     * Fetches a block by block hash from the db.
     * 
     * @param {string} server Which Conseil server to go against
     * @param {String} hash The block's hash
     * @param apiKey API key to use for Conseil server.
     * 
     * @returns {Promise<TezosBlock>}   The block
     */
    export function getBlock(server: string, hash: String, apiKey: string): Promise<TezosBlockWithOperationGroups> {
        return queryConseilServer(server, `blocks/${hash}`, apiKey)
            .then(json => json as TezosBlockWithOperationGroups);
    }

    /**
     * Fetch a given operation group
     * 
     * @param {string} server Which Conseil server to go against
     * @param {String} hash Operation group hash
     * @param apiKey API key to use for Conseil server.
     * @returns {Promise<TezosOperationGroupWithOperations>} Operation group along with associated operations and accounts
     * 
     * @deprecated since beta 2.0
     */
    export function getOperationGroup(server: string, hash: String, apiKey: string): Promise<TezosOperationGroupWithOperations> {
        return queryConseilServer(server, `operation_groups/${hash}`, apiKey)
            .then(json => json as TezosOperationGroupWithOperations);
    }

    /**
     * Fetches all operation groups.
     * 
     * @param {string} server Which Conseil server to go against
     * @param {TezosFilter} filter Filters to apply
     * @param apiKey API key to use for Conseil server.
     * @returns {Promise<TezosOperationGroup[]>} List of operation groups
     * 
     * @deprecated since beta 2.0
     */
    export function getOperationGroups(server: string, filter: TezosFilter, apiKey: string): Promise<TezosOperationGroup[]> {
        return queryConseilServerWithFilter(server, 'operation_groups', filter, apiKey)
            .then(json => json as TezosOperationGroup[]);
    }

    /**
     * Fetches all operations.
     * 
     * @param {string} server Which Conseil server to go against
     * @param {TezosFilter} filter Filters to apply
     * @param apiKey API key to use for Conseil server.
     * @returns {Promise<TezosOperationGroup[]>} List of operations
     * 
     * @deprecated since beta 2.0
     */
    export function getOperations(server: string, filter: TezosFilter, apiKey: string): Promise<TezosOperation[]> {
        return queryConseilServerWithFilter(server, 'operations', filter, apiKey)
            .then(json => json as TezosOperation[]);
    }

    /**
     * Fetches prevailing fees.
     * 
     * @param {string} server Which Conseil server to go against
     * @param {TezosFilter} filter Filters to apply. 'operation_kind' and 'limit' should be explicitly set for maximum accuracy.
     * @param apiKey API key to use for Conseil server.
     * @returns {Promise<TezosOperationGroup[]>} Low, medium and high fee levels.
     * 
     * @deprecated since beta 2.0
     */
    export function getAverageFees(server: string, filter: TezosFilter, apiKey: string): Promise<OperationFees> {
        return queryConseilServerWithFilter(server, 'operations/avgFees', filter, apiKey)
            .then(json => json as OperationFees);
    }

    /**
     * Fetches an account by account id from the DB.
     * 
     * @param {string} server  Which Conseil server to go against
     * @param {String} hash The account's id number
     * @param apiKey    API key to use for Conseil server.
     * @returns {Promise<TezosAccountWithOperationGroups>}  The account with its associated operation groups
     * 
     * @deprecated since beta 2.0
     */
    export function getAccount(server: string, hash: String, apiKey: string): Promise<TezosAccountWithOperationGroups> {
        return queryConseilServer(server, `accounts/${hash}`, apiKey)
            .then(json => json as TezosAccountWithOperationGroups);
    }
    /**
     * Fetches all blocks from the DB.
     * 
     * @param {string} server  Which Conseil server to go against
     * @param {TezosFilter} filter  Filters to apply
     * @param apiKey    API key to use for Conseil server.
     * @returns {Promise<TezosBlock[]>} List of blocks
     * 
     * @deprecated since beta 2.0
     */
    export function getBlocks(server: string, filter: TezosFilter, apiKey: string): Promise<TezosBlock[]> {
        return queryConseilServerWithFilter(server, 'blocks', filter, apiKey)
            .then(json => json as TezosBlock[]);
    }

    /**
     * Fetches a list of accounts from the DB.
     * 
     * @param {string} server Which Tezos network to go against
     * @param {TezosFilter} filter Filters to apply
     * @param apiKey API key to use for Conseil server.
     * @returns {Promise<TezosAccount[]>} List of accounts
     * 
     * @deprecated since beta 2.0
     */
    export function getAccounts(server: string, filter: TezosFilter, apiKey: string): Promise<TezosAccount[]> {
        return queryConseilServerWithFilter(server, 'accounts', filter, apiKey)
            .then(json => json as TezosAccount[]);
    }
}

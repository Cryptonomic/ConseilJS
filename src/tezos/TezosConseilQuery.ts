import {
    TezosAccount,
    TezosAccountWithOperationGroups,
    TezosBlock, TezosBlockWithOperationGroups, TezosOperation,
    TezosOperationGroup,
    TezosOperationGroupWithOperations
} from "../utils/ConseilTypes";
import {queryConseilServer, queryConseilServerWithFilter} from "../utils/ConseilQuery";

/**
 * Functions for querying the Conseil backend REST API
 */

/**
 * Filter with predicates for querying Conseil server
 * Se Conseil REST API documentation for usage.
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
     * @returns {TezosFilter}   Empty Tezos filter
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
     * @param {string} network  Which Tezos network to go against
     * @returns {Promise<TezosBlock>}   Latest block.
     */
    export function getBlockHead(network: string): Promise<TezosBlock> {
        return queryConseilServer(network, 'blocks/head')
            .then(json => {
                return <TezosBlock> json
            })
    }

    /**
     * Fetches a block by block hash from the db.
     * @param {string} network  Which Tezos network to go against
     * @param {String} hash The block's hash
     * @returns {Promise<TezosBlock>}   The block
     */
    export function getBlock(network: string, hash: String): Promise<TezosBlockWithOperationGroups> {
        return queryConseilServer(network, `blocks/${hash}`)
            .then(json => {
                return <TezosBlockWithOperationGroups> json
            })
    }

    /**
     * Fetch a given operation group
     * @param {string} network  Which Tezos network to go against
     * @param {String} hash Operation group hash
     * @returns {Promise<TezosOperationGroupWithOperations>}    Operation group along with associated operations and accounts
     */
    export function getOperationGroup(network: string, hash: String): Promise<TezosOperationGroupWithOperations> {
        return queryConseilServer(network, `operation_groups/${hash}`)
            .then(json => {
                return <TezosOperationGroupWithOperations> json
            })
    }

    /**
     * Fetches all operation groups.
     * @param {string} network  Which Tezos network to go against
     * @param {TezosFilter} filter  Filters to apply
     * @returns {Promise<TezosOperationGroup[]>}    List of operation groups
     */
    export function getOperationGroups(network: string, filter: TezosFilter): Promise<TezosOperationGroup[]> {
        return queryConseilServerWithFilter(network, 'operation_groups', filter)
            .then(json => {
                return <TezosOperationGroup[]> json
            })
    }

    /**
     * Fetches all operations.
     * @param {string} network  Which Tezos network to go against
     * @param {TezosFilter} filter  Filters to apply
     * @returns {Promise<TezosOperationGroup[]>}    List of operations
     */
    export function getOperations(network: string, filter: TezosFilter): Promise<TezosOperation[]> {
        return queryConseilServerWithFilter(network, 'operations', filter)
            .then(json => {
                return <TezosOperation[]> json
            })
    }

    /**
     * Fetches an account by account id from the db.
     * @param {string} network  Which Tezos network to go against
     * @param {String} hash The account's id number
     * @returns {Promise<TezosAccountWithOperationGroups>}  The account with its associated operation groups
     */
    export function getAccount(network: string, hash: String): Promise<TezosAccountWithOperationGroups> {
        return queryConseilServer(network, `accounts/${hash}`)
            .then(json => {
                return <TezosAccountWithOperationGroups> json
            })
    }
    /**
     * Fetches all blocks from the db.
     * @param {string} network  Which Tezos network to go against
     * @param {TezosFilter} filter  Filters to apply
     * @returns {Promise<TezosBlock[]>} List of blocks
     */
    export function getBlocks(network: string, filter: TezosFilter): Promise<TezosBlock[]> {
        return queryConseilServerWithFilter(network, 'blocks', filter)
            .then(json => {
                return <TezosBlock[]> json
            })
    }



    /**
     * Fetches a list of accounts from the db.
     * @param {string} network  Which Tezos network to go against
     * @param {TezosFilter} filter  Filters to apply
     * @returns {Promise<TezosAccount[]>}   List of accounts
     */
    export function getAccounts(network: string, filter: TezosFilter): Promise<TezosAccount[]> {
        return queryConseilServerWithFilter(network, 'accounts', filter)
            .then(json => {
                return <TezosAccount[]> json
            })
    }
}
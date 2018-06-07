import {
    TezosAccount,
    TezosAccountWithOperationGroups,
    TezosBlock,
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
    operation_group_kind: string[];
    operation_kind: string[];
    account_id: string[];
    account_manager: string[];
    account_delegate: string[];
}

/**
 * Fetches the most recent block stored in the database.
 * @param {string} network  Which Tezos network to go against
 * @returns {Promise<TezosBlock>}   Latest block.
 */
export function getBlockHead(network: string): Promise<TezosBlock> {
    return queryConseilServer(network, 'blocks/head', '')
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
export function getBlock(network: string, hash: String): Promise<TezosBlock> {
    return queryConseilServer(network, `blocks/${hash}`, '')
        .then(json => {
            return <TezosBlock> json
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
 * Fetch a given operation group
 * @param {string} network  Which Tezos network to go against
 * @param {String} hash Operation group hash
 * @returns {Promise<TezosOperationGroupWithOperations>}    Operation group along with associated operations and accounts
 */
export function getOperationGroup(network: string, hash: String): Promise<TezosOperationGroupWithOperations> {
    return queryConseilServer(network, `operations/${hash}`, '')
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
    return queryConseilServerWithFilter(network, 'operations', filter)
        .then(json => {
            return <TezosOperationGroup[]> json
        })
}

/**
 * Fetches an account by account id from the db.
 * @param {string} network  Which Tezos network to go against
 * @param {String} hash The account's id number
 * @returns {Promise<TezosAccountWithOperationGroups>}  The account with its associated operation groups
 */
export function getAccount(network: string, hash: String): Promise<TezosAccountWithOperationGroups> {
    return queryConseilServer(network, `accounts/${hash}`, '')
        .then(json => {
            return <TezosAccountWithOperationGroups> json
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
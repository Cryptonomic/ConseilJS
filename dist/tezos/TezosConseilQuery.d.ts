import { OperationFees, TezosAccount, TezosAccountWithOperationGroups, TezosBlock, TezosBlockWithOperationGroups, TezosOperation, TezosOperationGroup, TezosOperationGroupWithOperations } from "../utils/ConseilTypes";
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
export declare namespace TezosConseilQuery {
    /**
     * Convenience function for creating an empty Tezos filter which can later be overriden as desired.
     * @returns {TezosFilter}   Empty Tezos filter
     */
    function getEmptyTezosFilter(): TezosFilter;
    /**
     * Fetches the most recent block stored in the database.
     * @param {string} server  Which Conseil server to go against
     * @param apiKey    API key to use for Conseil server.
     * @returns {Promise<TezosBlock>}   Latest block.
     */
    function getBlockHead(server: string, apiKey: string): Promise<TezosBlock>;
    /**
     * Fetches a block by block hash from the db.
     * @param {string} server  Which Conseil server to go against
     * @param {String} hash The block's hash
     * @param apiKey    API key to use for Conseil server.
     * @returns {Promise<TezosBlock>}   The block
     */
    function getBlock(server: string, hash: String, apiKey: string): Promise<TezosBlockWithOperationGroups>;
    /**
     * Fetch a given operation group
     * @param {string} server  Which Conseil server to go against
     * @param {String} hash Operation group hash
     * @param apiKey    API key to use for Conseil server.
     * @returns {Promise<TezosOperationGroupWithOperations>}    Operation group along with associated operations and accounts
     */
    function getOperationGroup(server: string, hash: String, apiKey: string): Promise<TezosOperationGroupWithOperations>;
    /**
     * Fetches all operation groups.
     * @param {string} server  Which Conseil server to go against
     * @param {TezosFilter} filter  Filters to apply
     * @param apiKey    API key to use for Conseil server.
     * @returns {Promise<TezosOperationGroup[]>}    List of operation groups
     */
    function getOperationGroups(server: string, filter: TezosFilter, apiKey: string): Promise<TezosOperationGroup[]>;
    /**
     * Fetches all operations.
     * @param {string} server  Which Conseil server to go against
     * @param {TezosFilter} filter  Filters to apply
     * @param apiKey    API key to use for Conseil server.
     * @returns {Promise<TezosOperationGroup[]>}    List of operations
     */
    function getOperations(server: string, filter: TezosFilter, apiKey: string): Promise<TezosOperation[]>;
    /**
     * Fetches prevailing fees.
     * @param {string} server  Which Conseil server to go against
     * @param {TezosFilter} filter  Filters to apply. 'operation_kind' and 'limit' should be explicitly set for maximum accuracy.
     * @param apiKey    API key to use for Conseil server.
     * @returns {Promise<TezosOperationGroup[]>}    Low, medium and high fee levels.
     */
    function getAverageFees(server: string, filter: TezosFilter, apiKey: string): Promise<OperationFees>;
    /**
     * Fetches an account by account id from the db.
     * @param {string} server  Which Conseil server to go against
     * @param {String} hash The account's id number
     * @param apiKey    API key to use for Conseil server.
     * @returns {Promise<TezosAccountWithOperationGroups>}  The account with its associated operation groups
     */
    function getAccount(server: string, hash: String, apiKey: string): Promise<TezosAccountWithOperationGroups>;
    /**
     * Fetches all blocks from the db.
     * @param {string} server  Which Conseil server to go against
     * @param {TezosFilter} filter  Filters to apply
     * @param apiKey    API key to use for Conseil server.
     * @returns {Promise<TezosBlock[]>} List of blocks
     */
    function getBlocks(server: string, filter: TezosFilter, apiKey: string): Promise<TezosBlock[]>;
    /**
     * Fetches a list of accounts from the db.
     * @param {string} server  Which Tezos network to go against
     * @param {TezosFilter} filter  Filters to apply
     * @param apiKey    API key to use for Conseil server.
     * @returns {Promise<TezosAccount[]>}   List of accounts
     */
    function getAccounts(server: string, filter: TezosFilter, apiKey: string): Promise<TezosAccount[]>;
}

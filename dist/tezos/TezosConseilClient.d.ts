import { ConseilQuery, ConseilServerInfo } from "../utils/v2/ConseilQuery";
/**
 * Functions for querying the Conseil backend REST API v2
 */
export declare namespace TezosConseilClient {
    /**
     * Returns a record set for a specific entity of the Tezos platform. Entity list and metadata can be retrieved using ConseilMetadataClient.
     *
     * @param serverInfo Conseil server connection definition.
     * @param network Tezos network to query, mainnet, alphanet, etc.
     * @param entity Entity to retrieve.
     * @param query Query to submit.
     */
    function getTezosEntityData(serverInfo: ConseilServerInfo, network: string, entity: string, query: ConseilQuery): Promise<object>;
    /**
     * Get the head block from the Tezos platform given a network.
     *
     * @param serverInfo Conseil server connection definition.
     * @param network Tezos network to query, mainnet, alphanet, etc.
     */
    function getBlockHead(serverInfo: ConseilServerInfo, network: string): Promise<object>;
    /**
     * Get a block by hash from the Tezos platform given a network.
     *
     * @param serverInfo Conseil server connection definition.
     * @param network Tezos network to query, mainnet, alphanet, etc.
     * @param hash Block hash to query for.
     */
    function getBlock(serverInfo: ConseilServerInfo, network: string, hash: string): Promise<object>;
    /**
     * Get an account from the Tezos platform given a network by account id.
     *
     * @param serverInfo Conseil server connection definition.
     * @param network Tezos network to query, mainnet, alphanet, etc.
     * @param accountID Account hash to query for.
     */
    function getAccount(serverInfo: ConseilServerInfo, network: string, accountID: string): Promise<object>;
    /**
     * Get an operation group from the Tezos platform given a network by id.
     *
     * @param serverInfo Conseil server connection definition.
     * @param network Tezos network to query, mainnet, alphanet, etc.
     * @param operationGroupID Operation group hash to query for.
     */
    function getOperationGroup(serverInfo: ConseilServerInfo, network: string, operationGroupID: string): Promise<object>;
    /**
     * Request block-entity data for a given network. Rather than simply requesting a block by hash, this function allows modification of the response to contain a subset of block attributes subject to a filter on some of them.
     *
     * @param serverInfo Conseil server connection definition.
     * @param network Tezos network to query, mainnet, alphanet, etc.
     * @param query Conseil JSON query. See reference.
     *
     * @see [Conseil Query Format Spec]{@link https://github.com/Cryptonomic/Conseil/blob/master/doc/Query.md}
     */
    function getBlocks(serverInfo: ConseilServerInfo, network: string, query: ConseilQuery): Promise<object>;
    /**
     * Request account-entity data for a given network. Rather than simply requesting an account by hash, this function allows modification of the response to contain a subset of account attributes subject to a filter on some of them.
     *
     * @param serverInfo Conseil server connection definition.
     * @param network Tezos network to query, mainnet, alphanet, etc.
     * @param query Conseil JSON query. See reference.
     *
     * @see [Conseil Query Format Spec]{@link https://github.com/Cryptonomic/Conseil/blob/master/doc/Query.md}
     */
    function getAccounts(serverInfo: ConseilServerInfo, network: string, query: ConseilQuery): Promise<object>;
    /**
     * Request operation group-entity data for a given network. Rather than simply requesting an operation group by hash, this function allows modification of the response to contain a subset of operation group attributes subject to a filter on some of them.
     *
     * @param serverInfo Conseil server connection definition.
     * @param network Tezos network to query, mainnet, alphanet, etc.
     * @param query Conseil JSON query. See reference.
     *
     * @see [Conseil Query Format Spec]{@link https://github.com/Cryptonomic/Conseil/blob/master/doc/Query.md}
     */
    function getOperationGroups(serverInfo: ConseilServerInfo, network: string, query: ConseilQuery): Promise<object>;
    /**
     * Request operation-entity data for a given network. This function allows modification of the response to contain a subset of operation attributes subject to a filter on some of them.
     *
     * @param serverInfo Conseil server connection definition.
     * @param network Tezos network to query, mainnet, alphanet, etc.
     * @param query Conseil JSON query. See reference.
     *
     * @see [Conseil Query Format Spec]{@link https://github.com/Cryptonomic/Conseil/blob/master/doc/Query.md}
     */
    function getOperations(serverInfo: ConseilServerInfo, network: string, query: ConseilQuery): Promise<object>;
}

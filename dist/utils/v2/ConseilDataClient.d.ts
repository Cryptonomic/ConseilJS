import { ConseilServerInfo, ConseilQuery } from "../v2/QueryTypes";
/**
 * Utility functions for querying backend Conseil v2 API for metadata
 */
export declare namespace ConseilDataClient {
    /**
     * Requests data for a specific entity for a given platform/network combination, for example a block or an operation.
     *
     * @param serverInfo Conseil server connection definition.
     * @param platform Platform to query, eg: Tezos.
     * @param network Network to query, eg: mainnet.
     * @param entity Entity to query, eg: block, account, operation, etc.
     * @param query JSON object confirming to the Conseil query spec.
     */
    function executeEntityQuery(serverInfo: ConseilServerInfo, platform: string, network: string, entity: string, query: ConseilQuery): Promise<object>;
    /**
     * Requests data that may return result set composed of attributes of multiple entities.
     *
     * @param serverInfo Conseil server connection definition.
     * @param platform Platform to query, eg: Tezos.
     * @param network Network to query, eg: mainnet.
     * @param query JSON object confirming to the Conseil query spec.
     */
    function executeComplexQuery(serverInfo: ConseilServerInfo, platform: string, network: string, query: ConseilQuery): Promise<object>;
}

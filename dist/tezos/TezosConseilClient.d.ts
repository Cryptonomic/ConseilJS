import { ConseilQuery, ConseilServerInfo } from "../utils/v2/ConseilQuery";
import { ConseilDataClient } from "../utils/v2/ConseilDataClient";
/**
 * Functions for querying the Conseil backend REST API v2
 */
export declare class TezosConseilClient extends ConseilDataClient {
    BLOCKS: string;
    ACCOUNTS: string;
    OPERATION_GROUPS: string;
    OPERATIONS: string;
    /**
     * Returns a record set for a specific entity of the Tezos platform. Entity list and metadata can be retrieved using ConseilMetadataClient.
     *
     * @param serverInfo Conseil server connection definition.
     * @param network Tezos network to query, mainnet, alphanet, etc.
     * @param entity Entity to retrieve.
     * @param filter Filter to apply.
     */
    getTezosEntityData(serverInfo: ConseilServerInfo, network: string, entity: string, query: ConseilQuery): Promise<object>;
    /**
     * Get the head block from the Tezos platform given a network.
     *
     * @param serverInfo Conseil server connection definition.
     * @param network Tezos network to query, mainnet, alphanet, etc.
     */
    getBlockHead(serverInfo: ConseilServerInfo, network: string): Promise<object>;
    getBlock(serverInfo: ConseilServerInfo, network: string, hash: string): Promise<object>;
    getAccount(serverInfo: ConseilServerInfo, network: string, accountID: string): Promise<object>;
    getOperationGroup(serverInfo: ConseilServerInfo, network: string, operationGroupID: string): Promise<object>;
    getBlocks(serverInfo: ConseilServerInfo, network: string, query: ConseilQuery): Promise<object>;
    getAccounts(serverInfo: ConseilServerInfo, network: string, query: ConseilQuery): Promise<object>;
    getOperationGroups(serverInfo: ConseilServerInfo, network: string, query: ConseilQuery): Promise<object>;
    getOperations(serverInfo: ConseilServerInfo, network: string, query: ConseilQuery): Promise<object>;
}

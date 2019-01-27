import {ConseilOperator, ConseilQuery, ConseilSortDirection, ConseilServerInfo} from "../utils/v2/ConseilQuery";
import {ConseilDataClient} from "../utils/v2/ConseilDataClient";
import { url } from "inspector";

/**
 * Functions for querying the Conseil backend REST API v2
 */
export class TezosConseilClient extends ConseilDataClient {
    BLOCKS = 'blocks';
    ACCOUNTS = 'accounts';
    OPERATION_GROUPS = 'operation_groups';
    OPERATIONS = 'operations';

    /**
     * Returns a record set for a specific entity of the Tezos platform. Entity list and metadata can be retrieved using ConseilMetadataClient.
     * 
     * @param network Tezos network to query, mainnet, alphanet, etc.
     * @param entity Entity to retrieve.
     * @param filter Filter to apply.
     */
    async getTezosEntityData(serverInfo: ConseilServerInfo, network: string, entity: string, query: ConseilQuery): Promise<object> {
        return super.executeEntityQuery(serverInfo, 'tezos', network, entity, query);
    }

    /**
     * Get the head block from the Tezos platform given a network.
     * 
     * @param network Tezos network to query, mainnet, alphanet, etc.
     */
    async getBlockHead(serverInfo: ConseilServerInfo, network: string): Promise<object> {
        const query = new ConseilQuery().setOrdering('level', ConseilSortDirection.DESC).setLimit(1);

        return this.getTezosEntityData(serverInfo, network, this.BLOCKS, query);
    }

    async getBlock(serverInfo: ConseilServerInfo, network: string, hash: string): Promise<object> {
        const query = new ConseilQuery().addPredicate('hash', ConseilOperator.EQ, [hash], false).setLimit(1);

        return this.getTezosEntityData(serverInfo, network, this.BLOCKS, query);
    }

    async getAccount(serverInfo: ConseilServerInfo, network: string, accountID: string): Promise<object> {
        const query = new ConseilQuery().addPredicate('account_id', ConseilOperator.EQ, [accountID], false).setLimit(1);

        return this.getTezosEntityData(serverInfo, network, this.ACCOUNTS, query);
    }

    async getOperationGroup(serverInfo: ConseilServerInfo, network: string, operationGroupID: string): Promise<object> {
        const query = new ConseilQuery().addPredicate('operation_id', ConseilOperator.EQ, [operationGroupID], false).setLimit(1);

        return this.getTezosEntityData(serverInfo, network, this.OPERATION_GROUPS, query);
    }

    async getBlocks(serverInfo: ConseilServerInfo, network: string, query: ConseilQuery): Promise<object> {
        return this.getTezosEntityData(serverInfo, network, this.BLOCKS, query)
    }

    async getAccounts(serverInfo: ConseilServerInfo, network: string, query: ConseilQuery): Promise<object> {
        return this.getTezosEntityData(serverInfo, network, this.ACCOUNTS, query)
    }

    async getOperationGroups(serverInfo: ConseilServerInfo, network: string, query: ConseilQuery): Promise<object> {
        return this.getTezosEntityData(serverInfo, network, this.OPERATION_GROUPS, query)
    }

    async getOperations(serverInfo: ConseilServerInfo, network: string, query: ConseilQuery): Promise<object> {
        return this.getTezosEntityData(serverInfo, network, this.OPERATIONS, query)
    }
}

import {ConseilOperator, ConseilQuery, ConseilSortDirection, ConseilServerInfo} from "../utils/v2/ConseilQuery";
import {ConseilDataClient} from "../utils/v2/ConseilDataClient";

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
     * @param serverInfo Conseil server connection definition.
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
     * @param serverInfo Conseil server connection definition.
     * @param network Tezos network to query, mainnet, alphanet, etc.
     */
    async getBlockHead(serverInfo: ConseilServerInfo, network: string): Promise<object> {
        const query = new ConseilQuery().setOrdering('level', ConseilSortDirection.DESC).setLimit(1);

        return this.getTezosEntityData(serverInfo, network, this.BLOCKS, query);
    }

    /**
     * Get a block by hash from the Tezos platform given a network.
     * 
     * @param serverInfo Conseil server connection definition.
     * @param network Tezos network to query, mainnet, alphanet, etc.
     * @param hash Block hash to query for.
     */
    async getBlock(serverInfo: ConseilServerInfo, network: string, hash: string): Promise<object> {
        const query = new ConseilQuery().addPredicate('hash', ConseilOperator.EQ, [hash], false).setLimit(1);

        return this.getTezosEntityData(serverInfo, network, this.BLOCKS, query);
    }

    /**
     * Get an account from the Tezos platform given a network by account id.
     * 
     * @param serverInfo Conseil server connection definition.
     * @param network Tezos network to query, mainnet, alphanet, etc.
     * @param accountID Account hash to query for.
     */
    async getAccount(serverInfo: ConseilServerInfo, network: string, accountID: string): Promise<object> {
        const query = new ConseilQuery().addPredicate('account_id', ConseilOperator.EQ, [accountID], false).setLimit(1);

        return this.getTezosEntityData(serverInfo, network, this.ACCOUNTS, query);
    }

    /**
     * Get an operation group from the Tezos platform given a network by id.
     * 
     * @param serverInfo Conseil server connection definition.
     * @param network Tezos network to query, mainnet, alphanet, etc.
     * @param operationGroupID Operation group hash to query for.
     */
    async getOperationGroup(serverInfo: ConseilServerInfo, network: string, operationGroupID: string): Promise<object> {
        const query = new ConseilQuery().addPredicate('operation_id', ConseilOperator.EQ, [operationGroupID], false).setLimit(1);

        return this.getTezosEntityData(serverInfo, network, this.OPERATION_GROUPS, query);
    }

    /**
     * Request block-entity data for a given network. Rather than simply requesting a block by hash, this function allows modification of the response to contain a subset of block attributes subject to a filter on some of them.
     * 
     * @param serverInfo Conseil server connection definition.
     * @param network Tezos network to query, mainnet, alphanet, etc.
     * @param query Conseil JSON query. See reference.
     * 
     * @see [Conseil Query Format Spec]{@link https://github.com/Cryptonomic/Conseil/blob/master/doc/Query.md}
     */
    async getBlocks(serverInfo: ConseilServerInfo, network: string, query: ConseilQuery): Promise<object> {
        return this.getTezosEntityData(serverInfo, network, this.BLOCKS, query)
    }

    /**
     * Request account-entity data for a given network. Rather than simply requesting an account by hash, this function allows modification of the response to contain a subset of account attributes subject to a filter on some of them.
     * 
     * @param serverInfo Conseil server connection definition.
     * @param network Tezos network to query, mainnet, alphanet, etc.
     * @param query Conseil JSON query. See reference.
     * 
     * @see [Conseil Query Format Spec]{@link https://github.com/Cryptonomic/Conseil/blob/master/doc/Query.md}
     */
    async getAccounts(serverInfo: ConseilServerInfo, network: string, query: ConseilQuery): Promise<object> {
        return this.getTezosEntityData(serverInfo, network, this.ACCOUNTS, query)
    }

    /**
     * Request operation group-entity data for a given network. Rather than simply requesting an operation group by hash, this function allows modification of the response to contain a subset of operation group attributes subject to a filter on some of them.
     * 
     * @param serverInfo Conseil server connection definition.
     * @param network Tezos network to query, mainnet, alphanet, etc.
     * @param query Conseil JSON query. See reference.
     * 
     * @see [Conseil Query Format Spec]{@link https://github.com/Cryptonomic/Conseil/blob/master/doc/Query.md}
     */
    async getOperationGroups(serverInfo: ConseilServerInfo, network: string, query: ConseilQuery): Promise<object> {
        return this.getTezosEntityData(serverInfo, network, this.OPERATION_GROUPS, query)
    }

    /**
     * Request operation-entity data for a given network. This function allows modification of the response to contain a subset of operation attributes subject to a filter on some of them.
     * 
     * @param serverInfo Conseil server connection definition.
     * @param network Tezos network to query, mainnet, alphanet, etc.
     * @param query Conseil JSON query. See reference.
     * 
     * @see [Conseil Query Format Spec]{@link https://github.com/Cryptonomic/Conseil/blob/master/doc/Query.md}
     */
    async getOperations(serverInfo: ConseilServerInfo, network: string, query: ConseilQuery): Promise<object> {
        return this.getTezosEntityData(serverInfo, network, this.OPERATIONS, query)
    }
}

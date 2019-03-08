import {ConseilQueryBuilder} from "../ConseilQueryBuilder";
import {ConseilQuery, ConseilOperator, ConseilServerInfo, ConseilSortDirection} from "../../types/conseil/QueryTypes"
import {ConseilDataClient} from "../ConseilDataClient";
import {OperationKindType} from "../../types/tezos/TezosChainTypes";

/**
 * Functions for querying the Conseil backend REST API v2 for Tezos chain data.
 */
export namespace TezosConseilClient {
    const BLOCKS = 'blocks';
    const ACCOUNTS = 'accounts';
    const OPERATION_GROUPS = 'operation_groups';
    const OPERATIONS = 'operations';
    const FEES = 'fees';

    /**
     * Returns a record set for a specific entity of the Tezos platform. Entity list and metadata can be retrieved using ConseilMetadataClient.
     * 
     * @param serverInfo Conseil server connection definition.
     * @param network Tezos network to query, mainnet, alphanet, etc.
     * @param entity Entity to retrieve.
     * @param query Query to submit.
     */
    export async function getTezosEntityData(serverInfo: ConseilServerInfo, network: string, entity: string, query: ConseilQuery): Promise<any[]> {
        return ConseilDataClient.executeEntityQuery(serverInfo, 'tezos', network, entity, query);
    }

    /**
     * Get the head block from the Tezos platform given a network.
     * 
     * @param serverInfo Conseil server connection definition.
     * @param network Tezos network to query, mainnet, alphanet, etc.
     */
    export async function getBlockHead(serverInfo: ConseilServerInfo, network: string): Promise<any[]> {
        const query = ConseilQueryBuilder.setLimit(ConseilQueryBuilder.addOrdering(ConseilQueryBuilder.blankQuery(), 'level', ConseilSortDirection.DESC), 1);

        return getTezosEntityData(serverInfo, network, BLOCKS, query);
    }

    /**
     * Get a block by hash from the Tezos platform given a network.
     * 
     * @param serverInfo Conseil server connection definition.
     * @param network Tezos network to query, mainnet, alphanet, etc.
     * @param hash Block hash to query for.
     */
    export async function getBlock(serverInfo: ConseilServerInfo, network: string, hash: string): Promise<any[]> {
        const query = ConseilQueryBuilder.setLimit(ConseilQueryBuilder.addPredicate(ConseilQueryBuilder.blankQuery(), 'hash', ConseilOperator.EQ, [hash], false), 1);

        return getTezosEntityData(serverInfo, network, BLOCKS, query);
    }

    /**
     * Get an account from the Tezos platform given a network by account id.
     * 
     * @param serverInfo Conseil server connection definition.
     * @param network Tezos network to query, mainnet, alphanet, etc.
     * @param accountID Account hash to query for.
     */
    export async function getAccount(serverInfo: ConseilServerInfo, network: string, accountID: string): Promise<any[]> {
        const query = ConseilQueryBuilder.setLimit(ConseilQueryBuilder.addPredicate(ConseilQueryBuilder.blankQuery(), 'account_id', ConseilOperator.EQ, [accountID], false), 1);

        return getTezosEntityData(serverInfo, network, ACCOUNTS, query);
    }

    /**
     * Get an operation group from the Tezos platform given a network by id.
     * 
     * @param serverInfo Conseil server connection definition.
     * @param network Tezos network to query, mainnet, alphanet, etc.
     * @param operationGroupID Operation group hash to query for.
     */
    export async function getOperationGroup(serverInfo: ConseilServerInfo, network: string, operationGroupID: string): Promise<any[]> {
        const query = ConseilQueryBuilder.setLimit(ConseilQueryBuilder.addPredicate(ConseilQueryBuilder.blankQuery(), 'operation_id', ConseilOperator.EQ, [operationGroupID], false), 1);

        return getTezosEntityData(serverInfo, network, OPERATION_GROUPS, query);
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
    export async function getBlocks(serverInfo: ConseilServerInfo, network: string, query: ConseilQuery): Promise<any[]> {
        return getTezosEntityData(serverInfo, network, BLOCKS, query)
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
    export async function getAccounts(serverInfo: ConseilServerInfo, network: string, query: ConseilQuery): Promise<any[]> {
        return getTezosEntityData(serverInfo, network, ACCOUNTS, query)
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
    export async function getOperationGroups(serverInfo: ConseilServerInfo, network: string, query: ConseilQuery): Promise<any[]> {
        return getTezosEntityData(serverInfo, network, OPERATION_GROUPS, query)
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
    export async function getOperations(serverInfo: ConseilServerInfo, network: string, query: ConseilQuery): Promise<any[]> {
        return getTezosEntityData(serverInfo, network, OPERATIONS, query)
    }

    /**
     * Request pre-computed fee statistics for operation fees by operation kind. The query returns the latest record.
     * 
     * @param serverInfo Conseil server connection definition.
     * @param network Tezos network to query, mainnet, alphanet, etc.
     * @param operationType Tezos operation kind
     */
    export async function getFeeStatistics(serverInfo: ConseilServerInfo, network: string, operationType: OperationKindType) {
        let query = ConseilQueryBuilder.blankQuery();
        query = ConseilQueryBuilder.addPredicate(query, 'kind', ConseilOperator.EQ, [operationType]);
        query = ConseilQueryBuilder.addOrdering(query, 'timestamp', ConseilSortDirection.DESC);
        query = ConseilQueryBuilder.setLimit(query, 1);

        return getTezosEntityData(serverInfo, network, FEES, query);
    }
}

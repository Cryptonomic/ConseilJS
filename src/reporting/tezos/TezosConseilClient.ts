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
    const PROPOSALS = 'proposals';
    const BAKERS = 'bakers';
    const BALLOTS = 'ballots';

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
     * Get a block by hash from the Tezos platform given a network.
     * 
     * @param serverInfo Conseil server connection definition.
     * @param network Tezos network to query, mainnet, alphanet, etc.
     * @param {number} level Block level to query for.
     */
    export async function getBlockByLevel(serverInfo: ConseilServerInfo, network: string, level: number): Promise<any[]> {
        const query = ConseilQueryBuilder.setLimit(ConseilQueryBuilder.addPredicate(ConseilQueryBuilder.blankQuery(), 'level', ConseilOperator.EQ, [level], false), 1);

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
        return getTezosEntityData(serverInfo, network, OPERATIONS, query);
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

    export async function getProposals(serverInfo: ConseilServerInfo, network: string, query: ConseilQuery): Promise<any[]> {
        return getTezosEntityData(serverInfo, network, PROPOSALS, query);
    }

    export async function getBakers(serverInfo: ConseilServerInfo, network: string, query: ConseilQuery): Promise<any[]> {
        return getTezosEntityData(serverInfo, network, BAKERS, query);
    }

    export async function getBallots(serverInfo: ConseilServerInfo, network: string, query: ConseilQuery): Promise<any[]> {
        return getTezosEntityData(serverInfo, network, BALLOTS, query);
    }

    /**
     * Get a block by hash from the Tezos platform given a network.
     * 
     * @param serverInfo Conseil server connection definition.
     * @param network Tezos network to query, mainnet, alphanet, etc.
     * @param {string} hash Operation group hash of interest.
     * @param {number} duration Number of blocks to wait.
     */
    export async function awaitOperationConfirmation(serverInfo: ConseilServerInfo, network: string, hash: string, duration: number): Promise<any[]> {
        if (duration <= 0) { throw new Error('Invalid duration'); }
        const initialLevel = (await getBlockHead(serverInfo, network))[0]['level'];
        let currentLevel = initialLevel;
        const query = ConseilQueryBuilder.setLimit(ConseilQueryBuilder.addPredicate(ConseilQueryBuilder.blankQuery(), 'operation_group_hash', ConseilOperator.EQ, [hash], false), 1);

        while (initialLevel + duration > currentLevel) {
            const group = await getTezosEntityData(serverInfo, network, OPERATIONS, query);
            if (group.length > 0) { return group;}
            currentLevel = (await getBlockHead(serverInfo, network))[0]['level'];
            if (initialLevel + duration < currentLevel) { break; }
            await new Promise(resolve => setTimeout(resolve, 60 * 1000));
        }

        throw new Error(`Did not observe ${hash} on ${network} in ${duration} block${duration > 1 ? 's' : ''} since ${initialLevel}`);
    }
}

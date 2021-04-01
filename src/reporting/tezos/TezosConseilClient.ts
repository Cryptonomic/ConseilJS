import { ConseilQuery, ConseilOperator, ConseilServerInfo, ConseilSortDirection, ConseilFunction } from "../../types/conseil/QueryTypes"
import { OperationKindType } from "../../types/tezos/TezosChainTypes";
import { ContractMapDetails, ContractMapDetailsItem } from '../../types/conseil/ConseilTezosTypes';
import LogSelector from '../../utils/LoggerSelector';

import { ConseilDataClient } from "../ConseilDataClient";
import { ConseilQueryBuilder } from "../ConseilQueryBuilder";

const log = LogSelector.log;

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
    export async function getBlockHead(serverInfo: ConseilServerInfo, network: string): Promise<any> {
        const query = ConseilQueryBuilder.setLimit(ConseilQueryBuilder.addOrdering(ConseilQueryBuilder.blankQuery(), 'level', ConseilSortDirection.DESC), 1);

        const r = await getTezosEntityData(serverInfo, network, BLOCKS, query);
        return r[0];
    }

    /**
     * Get a block by hash from the Tezos platform given a network.
     *
     * @param serverInfo Conseil server connection definition.
     * @param network Tezos network to query, mainnet, alphanet, etc.
     * @param hash Block hash to query for.
     */
    export async function getBlock(serverInfo: ConseilServerInfo, network: string, hash: string): Promise<any> {
        if (hash === 'head') { return getBlockHead(serverInfo, network); }

        const query = ConseilQueryBuilder.setLimit(ConseilQueryBuilder.addPredicate(ConseilQueryBuilder.blankQuery(), 'hash', ConseilOperator.EQ, [hash], false), 1);

        const r = await getTezosEntityData(serverInfo, network, BLOCKS, query);
        return r[0];
    }

    /**
     * Get a block by hash from the Tezos platform given a network.
     *
     * @param serverInfo Conseil server connection definition.
     * @param network Tezos network to query, mainnet, alphanet, etc.
     * @param {number} level Block level to query for.
     */
    export async function getBlockByLevel(serverInfo: ConseilServerInfo, network: string, level: number): Promise<any> {
        const query = ConseilQueryBuilder.setLimit(ConseilQueryBuilder.addPredicate(ConseilQueryBuilder.blankQuery(), 'level', ConseilOperator.EQ, [level], false), 1);

        const r = await getTezosEntityData(serverInfo, network, BLOCKS, query);
        return r[0];
    }

    /**
     * Get an account from the Tezos platform given a network by account id.
     *
     * @param serverInfo Conseil server connection definition.
     * @param network Tezos network to query, mainnet, alphanet, etc.
     * @param accountID Account hash to query for.
     */
    export async function getAccount(serverInfo: ConseilServerInfo, network: string, accountID: string): Promise<any> {
        const query = ConseilQueryBuilder.setLimit(ConseilQueryBuilder.addPredicate(ConseilQueryBuilder.blankQuery(), 'account_id', ConseilOperator.EQ, [accountID], false), 1);

        const r = await getTezosEntityData(serverInfo, network, ACCOUNTS, query);
        return r[0];
    }

    /**
     * Get an operation group from the Tezos platform given a network, by id.
     *
     * @param serverInfo Conseil server connection definition.
     * @param network Tezos network to query, mainnet, alphanet, etc.
     * @param operationGroupID Operation group hash to query for.
     */
    export async function getOperationGroup(serverInfo: ConseilServerInfo, network: string, operationGroupID: string): Promise<any> {
        const query = ConseilQueryBuilder.setLimit(ConseilQueryBuilder.addPredicate(ConseilQueryBuilder.blankQuery(), 'hash', ConseilOperator.EQ, [operationGroupID], false), 1);

        const r = await getTezosEntityData(serverInfo, network, OPERATION_GROUPS, query);
        return r[0];
    }

    /**
     * Get an operation from the Tezos platform given a network, by id.
     *
     * @param serverInfo Conseil server connection definition.
     * @param network Tezos network to query, mainnet, alphanet, etc.
     * @param operationGroupID Operation group hash to query for.
     */
    export async function getOperation(serverInfo: ConseilServerInfo, network: string, operationGroupID: string): Promise<any> {
        const query = ConseilQueryBuilder.setLimit(ConseilQueryBuilder.addPredicate(ConseilQueryBuilder.blankQuery(), 'operation_group_hash', ConseilOperator.EQ, [operationGroupID], false), 1);

        const r = await getTezosEntityData(serverInfo, network, OPERATIONS, query);
        return r[0];
    }

    /**
     * Request block-entity data for a given network. Rather than simply requesting a block by hash, this function allows modification of the response to contain a subset of block attributes subject to a filter on some of them.
     *
     * @param serverInfo Conseil server connection definition.
     * @param network Tezos network to query, mainnet, alphanet, etc.
     * @param query Conseil JSON query. See reference.
     *
     * @see [Conseil Query Format Spec]{@link https://github.com/Cryptonomic/Conseil/blob/master/docs/README.md#tezos-chain-data-query}
     */
    export async function getBlocks(serverInfo: ConseilServerInfo, network: string, query: ConseilQuery): Promise<any[]> {
        return getTezosEntityData(serverInfo, network, BLOCKS, query);
    }

    /**
     * Request account-entity data for a given network. Rather than simply requesting an account by hash, this function allows modification of the response to contain a subset of account attributes subject to a filter on some of them.
     *
     * @param serverInfo Conseil server connection definition.
     * @param network Tezos network to query, mainnet, alphanet, etc.
     * @param query Conseil JSON query. See reference.
     *
     * @see [Conseil Query Format Spec]{@link https://github.com/Cryptonomic/Conseil/blob/master/docs/README.md#tezos-chain-data-query}
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
     * @see [Conseil Query Format Spec]{@link https://github.com/Cryptonomic/Conseil/blob/master/docs/README.md#tezos-chain-data-query}
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
     * @see [Conseil Query Format Spec]{@link https://github.com/Cryptonomic/Conseil/blob/master/docs/README.md#tezos-chain-data-query}
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
     * Wait for the operation with the provided `hash` to appear on the chain for up to `duration` blocks.
     *
     * @param serverInfo Conseil server connection definition.
     * @param network Tezos network to query, mainnet, alphanet, etc.
     * @param {string} hash Operation group hash of interest.
     * @param {number} duration Number of blocks to wait.
     * @param {number} blocktime Expected number of seconds between blocks.
     *
     * @returns Operation record
     */
    export async function awaitOperationConfirmation(serverInfo: ConseilServerInfo, network: string, hash: string, duration: number, blocktime: number = 60): Promise<any> {
        if (duration <= 0) { throw new Error('Invalid duration'); }

        const initialLevel = (await getBlockHead(serverInfo, network))['level'];
        const timeOffset = 180000;
        const startTime = (new Date).getTime() - timeOffset;
        const estimatedEndTime = startTime + timeOffset + duration * blocktime * 1000;

        log.debug(`TezosConseilClient.awaitOperationConfirmation looking for ${hash} since ${initialLevel} at ${(new Date(startTime).toUTCString())}, +${duration}`);

        let currentLevel = initialLevel;
        let operationQuery = ConseilQueryBuilder.blankQuery();
        operationQuery = ConseilQueryBuilder.addPredicate(operationQuery , 'operation_group_hash', ConseilOperator.EQ, [hash], false);
        operationQuery = ConseilQueryBuilder.addPredicate(operationQuery , 'timestamp', ConseilOperator.AFTER, [startTime], false);
        operationQuery = ConseilQueryBuilder.setLimit(operationQuery, 1);

        while (initialLevel + duration > currentLevel) {
            const group = await getOperations(serverInfo, network, operationQuery);
            if (group.length > 0) { return group[0]; }

            currentLevel = (await getBlockHead(serverInfo, network))['level'];

            if (initialLevel + duration < currentLevel) { break; }
            if ((new Date).getTime() > estimatedEndTime) { break; }

            await new Promise(resolve => setTimeout(resolve, blocktime * 1000));
        }

        throw new Error(`Did not observe ${hash} on ${network} in ${duration} block${duration > 1 ? 's' : ''} since ${initialLevel}`);
    }

    /**
     * Wait for the operation with the provided `hash` to appear on the chain for up to `duration` blocks. Then wait for an additional `depth` blocks to ensure that a fork has not occurred.
     *
     * @param serverInfo Conseil server connection definition.
     * @param network Tezos network to query, mainnet, alphanet, etc.
     * @param {string} hash Operation group hash of interest.
     * @param {number} duration Number of blocks to wait.
     * @param {number} depth Number of blocks to skip for fork validation.
     *
     * @returns `true` if the chain ids match between the original operation block and the current head, false otherwise.
     */
    export async function awaitOperationForkConfirmation(serverInfo: ConseilServerInfo, network: string, hash: string, duration: number, depth: number): Promise<boolean> {
        const op = await awaitOperationConfirmation(serverInfo, network, hash, duration);
        const initialLevel: number = op['block_level'];
        const initialHash: string = op['block_hash'];
        let currentLevel = initialLevel;

        await new Promise(resolve => setTimeout(resolve, depth * 50 * 1000));

        while (currentLevel < initialLevel + depth) {
            const currentBlock = await getBlockHead(serverInfo, network);
            currentLevel = currentBlock['level'];
            if (currentLevel >= initialLevel + depth) { break; }
            await new Promise(resolve => setTimeout(resolve, 60 * 1000));
        }

        let blockSequenceQuery = ConseilQueryBuilder.blankQuery();
        blockSequenceQuery = ConseilQueryBuilder.addFields(blockSequenceQuery, 'level', 'hash', 'predecessor');
        blockSequenceQuery = ConseilQueryBuilder.addPredicate(blockSequenceQuery, 'level', ConseilOperator.BETWEEN, [initialLevel - 1, initialLevel + depth]);
        blockSequenceQuery = ConseilQueryBuilder.setLimit(blockSequenceQuery, depth * 2);
        const blockSequenceResult = await getBlocks(serverInfo, network, blockSequenceQuery);

        if (blockSequenceResult.length === depth + 2) {
            return fastBlockContinuity(blockSequenceResult, initialLevel, initialHash);
        } else {
            return slowBlockContinuity(blockSequenceResult, initialLevel, initialHash, depth);
        }
    }

    /**
     * Returns big_map data for a given contract if any is available.
     * 
     * @param serverInfo Conseil server connection definition.
     * @param contract Contract address to query for.
     */
    export async function getBigMapData(serverInfo: ConseilServerInfo, contract: string): Promise<ContractMapDetails | undefined> {
        if (!contract.startsWith('KT1')) { throw new Error('Invalid address'); }

        const ownerQuery = ConseilQueryBuilder.setLimit(ConseilQueryBuilder.addFields(ConseilQueryBuilder.addPredicate(ConseilQueryBuilder.blankQuery(), 'account_id', ConseilOperator.EQ, [contract], false), 'big_map_id'), 100);
        const ownerResult = await getTezosEntityData(serverInfo, serverInfo.network, 'originated_account_maps', ownerQuery);

        if (ownerResult.length < 1) { return undefined; }

        const definitionQuery = ConseilQueryBuilder.setLimit(ConseilQueryBuilder.addPredicate(ConseilQueryBuilder.blankQuery(), 'big_map_id', (ownerResult.length > 1 ? ConseilOperator.IN : ConseilOperator.EQ), ownerResult.map(r => r.big_map_id), false), 100);
        const definitionResult = await getTezosEntityData(serverInfo, serverInfo.network, 'big_maps', definitionQuery);

        const contentQuery = ConseilQueryBuilder.setLimit(ConseilQueryBuilder.addFields(ConseilQueryBuilder.addPredicate(ConseilQueryBuilder.blankQuery(), 'big_map_id', (ownerResult.length > 1 ? ConseilOperator.IN : ConseilOperator.EQ), ownerResult.map(r => r.big_map_id), false), 'big_map_id', 'key', 'value'), 1000);
        const contentResult = await getTezosEntityData(serverInfo, serverInfo.network, 'big_map_contents', contentQuery);

        let maps: ContractMapDetailsItem[] = [];
        for (const d of definitionResult) {
            const definition = { index: Number(d['big_map_id']), key: d['key_type'], value: d['value_type'] };

            let content: { key: string, value: string }[] = [];
            for(const c of contentResult.filter(r => r['big_map_id'] === definition.index)) {
                content.push({ key: JSON.stringify(c['key']), value: JSON.stringify(c['value'])});
            }

            maps.push({definition, content});
        }

        return { contract, maps };
    }

    /**
     * Returns a value for a given plain-text key. The big map id is either provided as a paramter or the smallest of the possibly multiple big maps associated with the given contract address is used. Note that sometimes key values must be wrapped in quotes for key types that are non-numeric and not byte type.
     * 
     * Under normal circumstances these keys are hashed and TezosNodeReader.getValueForBigMapKey() expects such an encoded key. However, with the Conseil indexer it's possible to query for plain-text keys.
     * 
     * @param serverInfo Conseil server connection definition.
     * @param key Key to query for.
     * @param contract Optional contract address to be used to identify an associated big map.
     * @param mapIndex Optional big map index to query, but one of contract or mapIndex must be provided.
     */
    export async function getBigMapValueForKey(serverInfo: ConseilServerInfo, key: string, contract: string = '', mapIndex: number = -1): Promise<string> {
        if (!contract.startsWith('KT1')) { throw new Error('Invalid address'); }
        if (key.length < 1) { throw new Error('Invalid key'); }
        if (mapIndex < 0 && contract.length === 0) { throw new Error('One of contract or mapIndex must be specified'); }

        if (mapIndex < 0 && contract.length > 0) {
            let ownerQuery = ConseilQueryBuilder.setLimit(ConseilQueryBuilder.blankQuery(), 1);
            ownerQuery = ConseilQueryBuilder.addFields(ownerQuery, 'big_map_id');
            ownerQuery = ConseilQueryBuilder.addPredicate(ownerQuery, 'account_id', ConseilOperator.EQ, [contract], false);
            ownerQuery = ConseilQueryBuilder.addOrdering(ownerQuery, 'big_map_id', ConseilSortDirection.DESC);

            const ownerResult = await getTezosEntityData(serverInfo, serverInfo.network, 'originated_account_maps', ownerQuery);

            if (ownerResult.length < 1) { throw new Error(`Could not find any maps for ${contract}`); }
            mapIndex = ownerResult[0];
        }

        let contentQuery = ConseilQueryBuilder.setLimit(ConseilQueryBuilder.blankQuery(), 1);
        contentQuery = ConseilQueryBuilder.addFields(contentQuery, 'value');
        contentQuery = ConseilQueryBuilder.addPredicate(contentQuery, 'key', ConseilOperator.EQ, [key], false);
        contentQuery = ConseilQueryBuilder.addPredicate(contentQuery, 'big_map_id', ConseilOperator.EQ, [mapIndex], false);
        const contentResult = await getTezosEntityData(serverInfo, serverInfo.network, 'big_map_contents', contentQuery);

        if (contentResult.length < 1) { throw new Error(`Could not a value for key ${key} in map ${mapIndex}`); }

        return contentResult[0];
    }

    /**
     * Confirms that the specified operation was recorded on a continuous block sequence starting with the level below the block where
     * it appeared through the end of the sequence from `awaitOperationForkConfirmation()` with the depth that was called with. This method is
     * useful when the sequence of blocks retrieved by `awaitOperationForkConfirmation()` is the expected length, meaning `depth + 2`.
     *
     * Note, this is not an absolute guarantee that this operation is not part of a longer fork; just that the predecessor of each block
     * at position `n` matches the hash of the block preceding it.
     */
    function fastBlockContinuity(blocks, initialLevel: number, initialHash: string): boolean {
        try {
            return blocks.sort((a, b) => parseInt(a['level']) - parseInt(b['level'])).reduce((a, c, i) => {
                if (!a) { throw new Error('Block sequence mismatch'); }

                if (i > 1) {
                    return c['predecessor'] === blocks[i - 1]['hash'];
                }

                if (i === 1) {
                    return a && c['level'] === initialLevel
                            && c['hash'] === initialHash
                            && c['predecessor'] === blocks[i - 1]['hash'];
                }

                if (i === 0) {
                    return true;
                }
            }, true);
        } catch {
            return false;
        }
    }

    /**
     * Compared to `fastBlockContinuity()`, this method performs more sophisticated validation on the block sequence. This function is
     * useful where `awaitOperationForkConfirmation()` receives a longer sequence of blocks than expected, more than `depth + 2`. In this
     * case it's necessary to reconstruct a sequence from the provided blocks where of each block at position `n` matches the hash of
     * the block preceding it with the expectation that there will be at least one instance of a duplicate level.
     */
    function slowBlockContinuity(blocks, initialLevel: number, initialHash: string, depth: number): boolean {
        throw new Error('Not implemented'); // TODO
    }

    /**
     * Returns an entity query for the given ID. Positive numbers are interpreted as block level, strings starting with B as block hashes, strings starting with 'o' as operation group hashes, strings starting with 'tz1', 'tz2', 'tz3' or 'KT1' as account hashes.
     *
     * @param id
     * @returns {{entity: string, query: ConseilQuery}} entity, query pair
     */
    export function getEntityQueryForId(id: string | number): { entity: string, query: ConseilQuery } {
        let q = ConseilQueryBuilder.setLimit(ConseilQueryBuilder.blankQuery(), 1);

        if (typeof id  === 'number') {
            const n = Number(id);
            if (n < 0) { throw new Error('Invalid numeric id parameter'); }

            return { entity: BLOCKS, query: ConseilQueryBuilder.addPredicate(q, 'level', ConseilOperator.EQ, [id], false) };
        } else if (typeof id  === 'string') {
            const s = String(id);

            if (s.startsWith('tz1') || s.startsWith('tz2') || s.startsWith('tz3') || s.startsWith('KT1')) {
                return { entity: ACCOUNTS, query: ConseilQueryBuilder.addPredicate(q, 'account_id', ConseilOperator.EQ, [id], false) };
            } else if (s.startsWith('B')) {
                return { entity: BLOCKS, query: ConseilQueryBuilder.addPredicate(q, 'hash', ConseilOperator.EQ, [id], false) };
            } else if (s.startsWith('o')) {
                q = ConseilQueryBuilder.setLimit(q, 1000);
                q = ConseilQueryBuilder.addPredicate(q, 'operation_group_hash', ConseilOperator.EQ, [id], false);
                q = ConseilQueryBuilder.addOrdering(q, 'nonce', ConseilSortDirection.DESC);
                return { entity: OPERATIONS, query: q};
            }
        }

        throw new Error('Invalid id parameter');
    }

    export async function countKeysInMap(serverInfo: ConseilServerInfo, mapIndex: number): Promise<number> {
        let countQuery = ConseilQueryBuilder.blankQuery();
        countQuery = ConseilQueryBuilder.addFields(countQuery, 'key');
        countQuery = ConseilQueryBuilder.addPredicate(countQuery, 'big_map_id', ConseilOperator.EQ, [mapIndex]);
        countQuery = ConseilQueryBuilder.addAggregationFunction(countQuery, 'key', ConseilFunction.count);
        countQuery = ConseilQueryBuilder.setLimit(countQuery, 1);
        const result = await ConseilDataClient.executeEntityQuery(serverInfo, 'tezos', serverInfo.network, 'big_map_contents', countQuery);
        
        try {
            return result[0]['count_key'];
        } catch {
            return -1;
        }
    }
}

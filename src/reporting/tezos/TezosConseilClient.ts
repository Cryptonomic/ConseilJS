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
        const query = ConseilQueryBuilder.setLimit(ConseilQueryBuilder.addPredicate(ConseilQueryBuilder.blankQuery(), 'hash', ConseilOperator.EQ, [operationGroupID], false), 1);

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
    export async function awaitOperationConfirmation(serverInfo: ConseilServerInfo, network: string, hash: string, duration: number, blocktime: number = 60): Promise<any[]> {
        if (duration <= 0) { throw new Error('Invalid duration'); }
        const initialLevel = (await getBlockHead(serverInfo, network))['level'];
        let currentLevel = initialLevel;
        let operationQuery = ConseilQueryBuilder.blankQuery();
        operationQuery = ConseilQueryBuilder.addPredicate(operationQuery , 'operation_group_hash', ConseilOperator.EQ, [hash], false);
        operationQuery = ConseilQueryBuilder.addPredicate(operationQuery , 'timestamp', ConseilOperator.AFTER, [(new Date).getTime() - 60000], false);
        operationQuery = ConseilQueryBuilder.setLimit(operationQuery, 1);

        while (initialLevel + duration > currentLevel) {
            const group = await getOperations(serverInfo, network, operationQuery);
            if (group.length > 0) { return group; }
            currentLevel = (await getBlockHead(serverInfo, network))['level'];
            if (initialLevel + duration < currentLevel) { break; }
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
                return { entity: OPERATIONS, query: ConseilQueryBuilder.addPredicate(q, 'operation_group_hash', ConseilOperator.EQ, [id], false) };
            }
        }

        throw new Error('Invalid id parameter');
    }
}

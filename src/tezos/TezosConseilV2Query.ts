import {ConseilV2Filter, ConseilV2Operator, ConseilV2Query, ConseilV2SortDirection} from "../utils/ConseilV2Query";

/**
 * Functions for querying the Conseil backend REST API v2
 */

export namespace TezosConseilV2Query {

    const TEZOS = 'tezos';
    const BLOCKS = 'blocks';
    const ACCOUNTS = 'accounts';
    const OPERATION_GROUPS = 'operation_groups';
    const OPERATIONS = 'operations';

    export async function getBlockHead(server: string, apiKey: string, network: string): Promise<object> {
        let filter = ConseilV2Query.getEmptyFilter();
        filter = ConseilV2Query.setOrderingForFilter(filter, 'level', ConseilV2SortDirection.DESC);
        filter = ConseilV2Query.setLimitForFilter(filter, 1);
        return ConseilV2Query.runDataQuery(apiKey, server, TEZOS, network, BLOCKS , filter)
    }

    export async function getBlock(server: string, apiKey: string, network: string, hash: string): Promise<object> {
        let filter = ConseilV2Query.getEmptyFilter();
        filter = ConseilV2Query.addPredicateToFilter(filter, 'hash', ConseilV2Operator.EQ, [hash], false);
        filter = ConseilV2Query.setLimitForFilter(filter, 1);
        return ConseilV2Query.runDataQuery(apiKey, server, TEZOS, network, BLOCKS , filter)
    }

    export async function getAccount(server: string, apiKey: string, network: string, accountID: string): Promise<object> {
        let filter = ConseilV2Query.getEmptyFilter();
        filter = ConseilV2Query.addPredicateToFilter(filter, 'account_id', ConseilV2Operator.EQ, [accountID], false);
        filter = ConseilV2Query.setLimitForFilter(filter, 1);
        return ConseilV2Query.runDataQuery(apiKey, server, TEZOS, network, ACCOUNTS , filter)
    }

    export async function getOperationGroup(server: string, apiKey: string, network: string, operationGroupID: string): Promise<object> {
        let filter = ConseilV2Query.getEmptyFilter();
        filter = ConseilV2Query.addPredicateToFilter(filter, 'operation_id', ConseilV2Operator.EQ, [operationGroupID], false);
        filter = ConseilV2Query.setLimitForFilter(filter, 1);
        return ConseilV2Query.runDataQuery(apiKey, server, TEZOS, network, OPERATION_GROUPS , filter)
    }

    export async function getBlocks(server: string, apiKey: string, network: string, filter: ConseilV2Filter): Promise<object> {
        return ConseilV2Query.runDataQuery(apiKey, server, TEZOS, network, BLOCKS , filter)
    }

    export async function getAccounts(server: string, apiKey: string, network: string, filter: ConseilV2Filter): Promise<object> {
        return ConseilV2Query.runDataQuery(apiKey, server, TEZOS, network, ACCOUNTS , filter)
    }

    export async function getOperationGroups(server: string, apiKey: string, network: string, filter: ConseilV2Filter): Promise<object> {
        return ConseilV2Query.runDataQuery(apiKey, server, TEZOS, network, OPERATION_GROUPS , filter)
    }

    export async function getOperations(server: string, apiKey: string, network: string, filter: ConseilV2Filter): Promise<object> {
        return ConseilV2Query.runDataQuery(apiKey, server, TEZOS, network, OPERATIONS , filter)
    }
}
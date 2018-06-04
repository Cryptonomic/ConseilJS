import {TezosAccount} from "./TezosTypes";
import {queryNautilus, queryNautilusWithFilter} from "../utils/ConseilQuery";

export interface TezosFilter {
    limit: number;
    block_id: string[];
    block_level: number[];
    block_netid: string[];
    block_protocol: string[];
    operation_id: string[];
    operation_source: string[];
    account_id: string[];
    account_manager: string[];
    account_delegate: string[];
}

export function getBlockHead(network: string) {
    return queryNautilus(network, 'blocks/head', '');
}

export function getBlock(network: string, hash: String) {
    return queryNautilus(network, `blocks/${hash}`, '');
}

export function getBlocks(network: string, filter: TezosFilter) {
    return queryNautilusWithFilter(network, 'blocks', filter);
}

export function getOperation(network: string, hash: String) {
    return queryNautilus(network, `operations/${hash}`, '');
}

export function getOperations(network: string, filter: TezosFilter) {
    return queryNautilusWithFilter(network, 'operations', filter);
}

export function getAccount(network: string, hash: String): Promise<TezosAccount> {
    return queryNautilus(network, `accounts/${hash}`, '')
        .then(json => {
            return <TezosAccount> json
        })
}

export function getAccounts(network: string, filter: TezosFilter): Promise<TezosAccount[]> {
    return queryNautilusWithFilter(network, 'accounts', filter)
        .then(json => {
            return <TezosAccount[]> json
        })
}
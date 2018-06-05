import {
    TezosAccount,
    TezosAccountWithOperationGroups,
    TezosBlock,
    TezosOperationGroup,
    TezosOperationGroupWithOperations
} from "../utils/ConseilTypes";
import {queryConseilServer, queryConseilServerWithFilter} from "../utils/ConseilQuery";

export interface TezosFilter {
    limit: number;
    block_id: string[];
    block_level: number[];
    block_netid: string[];
    block_protocol: string[];
    operation_id: string[];
    operation_source: string[];
    operation_group_kind: string[];
    operation_kind: string[];
    account_id: string[];
    account_manager: string[];
    account_delegate: string[];
}

export function getBlockHead(network: string): Promise<TezosBlock> {
    return queryConseilServer(network, 'blocks/head', '')
        .then(json => {
            return <TezosBlock> json
        })
}

export function getBlock(network: string, hash: String): Promise<TezosBlock> {
    return queryConseilServer(network, `blocks/${hash}`, '')
        .then(json => {
            return <TezosBlock> json
        })
}

export function getBlocks(network: string, filter: TezosFilter): Promise<TezosBlock[]> {
    return queryConseilServerWithFilter(network, 'blocks', filter)
        .then(json => {
            return <TezosBlock[]> json
        })
}

export function getOperationGroup(network: string, hash: String): Promise<TezosOperationGroupWithOperations> {
    return queryConseilServer(network, `operations/${hash}`, '')
        .then(json => {
            return <TezosOperationGroupWithOperations> json
        })
}

export function getOperationGroups(network: string, filter: TezosFilter): Promise<TezosOperationGroup[]> {
    return queryConseilServerWithFilter(network, 'operations', filter)
        .then(json => {
            return <TezosOperationGroup[]> json
        })
}

export function getAccount(network: string, hash: String): Promise<TezosAccountWithOperationGroups> {
    return queryConseilServer(network, `accounts/${hash}`, '')
        .then(json => {
            return <TezosAccountWithOperationGroups> json
        })
}

export function getAccounts(network: string, filter: TezosFilter): Promise<TezosAccount[]> {
    return queryConseilServerWithFilter(network, 'accounts', filter)
        .then(json => {
            return <TezosAccount[]> json
        })
}
import * as querystring from 'querystring';
import fetch from 'node-fetch';
import {TezosAccount} from "../tezos/TezosTypes";

export interface ConseilFilter {
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

function queryNautilus(network: string, command: string, payload: string): Promise<object> {
    let url = `https://conseil.cryptonomic.tech:1337/tezos/${network}/${command}`;
    return fetch(url, {
        method: 'post',
        headers: {
            "apiKey": "hooman"
        },
        body: payload
    })
        .then(response => response.json());
}

function sanitizeFilter(filter: ConseilFilter): ConseilFilter {
    return {
        limit: filter.limit,
        block_id: filter.block_id.filter(Boolean),
        block_level: filter.block_level.filter(Boolean),
        block_netid: filter.block_netid.filter(Boolean),
        block_protocol: filter.block_protocol.filter(Boolean),
        operation_id: filter.operation_id.filter(Boolean),
        operation_source: filter.operation_source.filter(Boolean),
        account_id: filter.account_id.filter(Boolean),
        account_manager: filter.account_manager.filter(Boolean),
        account_delegate: filter.account_delegate.filter(Boolean)
    };
}

function queryNautilusWithFilter(network: string, command: string, filter: ConseilFilter) {
    let params = querystring.stringify(sanitizeFilter(filter));
    let cmdWithParams = `${command}?${params}`;
    return queryNautilus(network, cmdWithParams, '');
}

export function getBlockHead(network: string) {
    return queryNautilus(network, 'blocks/head', '');
}

export function getBlock(network: string, hash: String) {
    return queryNautilus(network, `blocks/${hash}`, '');
}

export function getBlocks(network: string, filter: ConseilFilter) {
    return queryNautilusWithFilter(network, 'blocks', filter);
}

export function getOperation(network: string, hash: String) {
    return queryNautilus(network, `operations/${hash}`, '');
}

export function getOperations(network: string, filter: ConseilFilter) {
    return queryNautilusWithFilter(network, 'operations', filter);
}

export function getAccount(network: string, hash: String): Promise<TezosAccount> {
    return queryNautilus(network, `accounts/${hash}`, '')
        .then( json => {return <TezosAccount> json})
}

export function getAccounts(network: string, filter: ConseilFilter): Promise<TezosAccount[]> {
    return queryNautilusWithFilter(network, 'accounts', filter)
        .then( json => {return <TezosAccount[]> json})
}
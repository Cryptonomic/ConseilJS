import * as querystring from "querystring";
import {TezosFilter} from "../tezos/TezosQuery";

export function queryNautilus(network: string, command: string, payload: string): Promise<object> {
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

export function sanitizeFilter(filter: TezosFilter): TezosFilter {
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

export function queryNautilusWithFilter(network: string, command: string, filter: TezosFilter) {
    let params = querystring.stringify(sanitizeFilter(filter));
    let cmdWithParams = `${command}?${params}`;
    return queryNautilus(network, cmdWithParams, '');
}
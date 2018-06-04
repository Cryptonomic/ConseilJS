import * as querystring from "querystring";
import fetch from 'node-fetch';
import {TezosFilter} from "../tezos/TezosQuery";

export function queryConseilServer(network: string, command: string, payload: string): Promise<object> {
    const https = require("https");
    const agent = new https.Agent({
        rejectUnauthorized: false
    })
    let url = `https://conseil.cryptonomic.tech:1337/tezos/${network}/${command}`;
    return fetch(url, {
        method: 'get',
        headers: {
            "apiKey": "hooman"
        },
        agent: agent
    })
        .then(response => {return response.json()});
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
        operation_group_kind: filter.operation_group_kind.filter(Boolean),
        operation_kind: filter.operation_kind.filter(Boolean),
        account_id: filter.account_id.filter(Boolean),
        account_manager: filter.account_manager.filter(Boolean),
        account_delegate: filter.account_delegate.filter(Boolean)
    };
}

export function queryConseilServerWithFilter(network: string, command: string, filter: TezosFilter) {
    let params = querystring.stringify(sanitizeFilter(filter));
    let cmdWithParams = `${command}?${params}`;
    return queryConseilServer(network, cmdWithParams, '');
}
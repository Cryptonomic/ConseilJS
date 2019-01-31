import * as querystring from "querystring";
import {TezosFilter} from "..";
import FetchSelector from './FetchSelector';

const fetch = FetchSelector.getFetch();

/**
 * Utility functions for querying backend Conseil API
 */

/**
 * Runs a query against Conseil backend API
 * TODO: Also make the blockchain a parameter
 * @param {string} server  Conseil server to go against
 * @param {string} route API route to query
 * @param {string} apiKey    API key to use for Conseil server.
 * @returns {Promise<object>}   JSON representation of response from Conseil
 */
export function queryConseilServer(server: string, route: string, apiKey: string): Promise<object> {
    const url = `${server}/${route}`;
    console.log(`Querying Conseil server at URL ${url}`);
    return fetch(url, {
        method: 'get',
        headers: {
            "apiKey": apiKey
        }
    })
        .then(response => {return response.json()});
}

/**
 * Runs a query against Conseil backend API with the given filter
 * @param {string} server  Conseil server to go against
 * @param {string} route    API route to query
 * @param {TezosFilter} filter  Conseil filter
 * @param {string} apiKey    API key to use for Conseil server.
 * @returns {Promise<object>}   Data returned by Conseil as a JSON object
 */
export function queryConseilServerWithFilter(server: string, route: string, filter: TezosFilter, apiKey: string): Promise<object> {
    let params = querystring.stringify(sanitizeFilter(filter));
    let cmdWithParams = `${route}?${params}`;
    return queryConseilServer(server, cmdWithParams, apiKey);
}

/**
 * Removes extraneous data from Conseil fitler predicates.
 * @param {TezosFilter} filter  Conseil filter
 * @returns {TezosFilter}   Sanitized Conseil filter
 */
function sanitizeFilter(filter: TezosFilter): TezosFilter {
    return {
        limit: filter.limit,
        block_id: filter.block_id.filter(Boolean),
        block_level: filter.block_level.filter(Boolean),
        block_netid: filter.block_netid.filter(Boolean),
        block_protocol: filter.block_protocol.filter(Boolean),
        operation_id: filter.operation_id.filter(Boolean),
        operation_source: filter.operation_source.filter(Boolean),
        operation_destination: filter.operation_destination.filter(Boolean),
        operation_participant: filter.operation_participant.filter(Boolean),
        operation_kind: filter.operation_kind.filter(Boolean),
        account_id: filter.account_id.filter(Boolean),
        account_manager: filter.account_manager.filter(Boolean),
        account_delegate: filter.account_delegate.filter(Boolean)
    };
}
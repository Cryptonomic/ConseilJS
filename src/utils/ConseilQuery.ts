import * as querystring from "querystring";
import fetch from 'node-fetch';
import {TezosFilter} from "..";

/**
 * Utility functions for querying backend Conseil API
 */

/**
 * Get Conseil URL to query
 * TODO: Remove hard coded URL
 * @param {string} network  Network to go against
 * @param {string} route API route to query
 * @param {string} customUrl    Custom URL override
 * @returns {string}   The URL
 */
export function getConseilURL(network: string, route: string, customUrl = '') {
    if(customUrl != '') return `${customUrl}/${route}`;
    else return `http://206.189.230.137:1337/tezos/${network}/${route}`;
}

/**
 * Runs a query against Conseil backend API
 * TODO: Also make the blockchain a parameter
 * @param {string} network  Network to go against
 * @param {string} route API route to query
 * @param customUrl
 * @returns {Promise<object>}   JSON representation of response from Conseil
 */
export function queryConseilServer(network: string, route: string, customUrl = ''): Promise<object> {
    const url = getConseilURL(network, route, customUrl);
    console.log(`Querying Conseil server at URL ${url}`);
    return fetch(url, {
        method: 'get',
        headers: {
            "apiKey": "hooman"
        }
    })
        .then(response => {return response.json()});
}

/**
 * Runs a query against Conseil backend API with the given filter
 * @param {string} network  Network to go against
 * @param {string} route    API route to query
 * @param {TezosFilter} filter  Conseil filter
 * @param {string} customUrl Custom URL override
 * @returns {Promise<object>}   Data returned by Conseil as a JSON object
 */
export function queryConseilServerWithFilter(network: string, route: string, filter: TezosFilter, customUrl = ''): Promise<object> {
    let params = querystring.stringify(sanitizeFilter(filter));
    let cmdWithParams = `${route}?${params}`;
    return queryConseilServer(network, cmdWithParams, customUrl);
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
        operation_destination: filter.operation_source.filter(Boolean),
        operation_participant: filter.operation_participant.filter(Boolean),
        operation_kind: filter.operation_kind.filter(Boolean),
        account_id: filter.account_id.filter(Boolean),
        account_manager: filter.account_manager.filter(Boolean),
        account_delegate: filter.account_delegate.filter(Boolean)
    };
}
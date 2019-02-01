import {Response} from 'node-fetch';
import FetchSelector from './FetchSelector';

const fetch = FetchSelector.getFetch();

/**
 * Generic functions for running queries against blockchain nodes.
 */

/**
 * Runs a query against a Tezos node.
 * TODO: Make blockchain agnostic
 * @param {string} server  Which Tezos node to go against
 * @param {string} command  RPC route to invoke
 * @returns {Promise<object>}   JSON-encoded response
 */
export function runGetQuery(server: string, command: string): Promise<object> {
    const url = `${server}${command}`;

    return fetch(url, {
        method: 'get',
    })
    .then(response => response.json())
    .then(json => {
        return new Promise<Object>(resolve => resolve(json))
    });
}

/**
 * Runs a query against a Tezos node.
 * TODO: Make blockchain agnostic
 * 
 * @param {string} server Which Tezos node to go against
 * @param {string} command RPC route to invoke
 * @param {object} payload Payload to submit
 * @returns {Promise<object>} JSON-encoded response
 */
export function runPostQuery(server: string, command: string, payload = {}): Promise<Response> {
    const url = `${server}/${command}`;
    const payloadStr = JSON.stringify(payload);

    return fetch(url, {
        method: 'post',
        body: payloadStr,
        headers: {
            'content-type': 'application/json'
        }
    })
}
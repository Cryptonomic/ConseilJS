import fetch, {Response} from 'node-fetch';

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
    const url = `${server}/${command}`;
    console.log(`Querying Tezos node with URL ${url}`);
    return fetch(url, {
        method: 'get',
    })
        .then(response => {return response.json()})
        .then(json => {
            console.log(`Reponse from Tezos node: ${JSON.stringify(json)}`);
            return new Promise<Object>(resolve => resolve(json))
        })
}

/**
 * Runs a query against a Tezos node.
 * TODO: Make blockchain agnostic
 * @param {string} server  Which Tezos node to go against
 * @param {string} command  RPC route to invoke
 * @param {object} payload  Payload to submit
 * @returns {Promise<object>}   JSON-encoded response
 */
export function runPostQuery(server: string, command: string, payload = {}): Promise<Response> {
    const url = `${server}/${command}`;
    const payloadStr = JSON.stringify(payload);
    console.log(`Querying Tezos node with URL ${url} and payload: ${payloadStr}`);
    return fetch(url, {
        method: 'post',
        body: payloadStr,
        headers: {
            'content-type': 'application/json'
        }
    })
}
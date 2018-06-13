import fetch, {Response} from 'node-fetch';

/**
 * Generic functions for running queries against blockchain nodes.
 */

/**
 * Runs a query against a Tezos node.
 * TODO: Make blockchain agnostic
 * @param {string} network  Network to query against
 * @param {string} command  RPC route to invoke
 * @returns {Promise<object>}   JSON-encoded response
 */
export function runGetQuery(network: string, command: string): Promise<object> {
    //const url = `http://nautilus.cryptonomic.tech:8732/tezos/${network}/${command}`;
    const url = `http://localhost:8732${command}`;
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
 * @param {string} network  Network to query against
 * @param {string} command  RPC route to invoke
 * @param {{}} payload  Payload to submit
 * @returns {Promise<object>}   JSON-encoded response
 */
export function runPostQuery(network: string, command: string, payload = {}): Promise<Response> {
    //const url = `http://nautilus.cryptonomic.tech:8732/tezos/${network}/${command}`;
    const url = `http://localhost:8732/${command}`;
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
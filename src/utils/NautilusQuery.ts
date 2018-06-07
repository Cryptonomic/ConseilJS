import fetch from 'node-fetch';

/**
 * Generic functions for running queries against blockchain nodes.
 */

/**
 * Runs a query against a Tezos node.
 * TODO: Make blockchain agnostic
 * @param {string} network  Network to query against
 * @param {string} command  RPC route to invoke
 * @param {{}} payload  Payload to submit
 * @returns {Promise<object>}   JSON-encoded response
 */
export function runQuery(network: string, command: string, payload = {}): Promise<object> {
    const url = `http://nautilus.cryptonomic.tech:8732/tezos/${network}/${command}`;
    const payloadStr = JSON.stringify(payload);
    console.log(`Querying Tezos node with URL ${url} and payload: ${payloadStr}`);
    return fetch(url, {
        method: 'post',
        body: payloadStr,
        headers: {
            'content-type': 'application/json'
        }
    })
        .then(response => {return response.json()})
        .then(json => {
            console.log(`Reponse from Tezos node: ${JSON.stringify(json)}`);
            return new Promise<Object>(resolve => resolve(json))
        })
}

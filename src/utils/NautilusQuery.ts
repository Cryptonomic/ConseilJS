import fetch, {Response} from 'node-fetch';

/**
 * Generic functions for running queries against blockchain nodes.
 */

/**
 * All preset Tezos node networks.
 */
export const tezosNodes: object = {
    zeronet: 'http://159.89.186.115:8732/',
    nautilus_tezos_zeronet: 'https://tezos-zeronet.cryptonomic-infra.tech/',
    nautilus_tezos_betanet: 'https://tezos-betanet.cryptonomic-infra.tech/'
};

/**
 * Figures out Tezos node URL to go against
 * @param {string} network  Preset network to query against
 * @param {string} command  RPC route to invoke
 * @param {string} customNode  Custom node URL, overrides the 'network' argument
 * @returns {Promise<object>}   JSON-encoded response
 */
export function getTezosNodeURL(network: string, command: string, customNode = ''): string {
    if (customNode != '') return `${customNode}/${command}`;
    const tezosNode = tezosNodes[network];
    if (tezosNode == null) throw new Error(`The Tezos network with alias ${network} does not exist!`);
    return `${tezosNode}/${command}`;
}

/**
 * Runs a query against a Tezos node.
 * TODO: Make blockchain agnostic
 * @param {string} network  Preset network to query against
 * @param {string} command  RPC route to invoke
 * @param {string} customNode  Custom node URL, overrides the 'network' argument
 * @returns {Promise<object>}   JSON-encoded response
 */
export function runGetQuery(network: string, command: string, customNode = ''): Promise<object> {
    const url = getTezosNodeURL(network, command, customNode);
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
 * @param {string} network  Preset network to query against
 * @param {string} command  RPC route to invoke
 * @param {object} payload  Payload to submit
 * @param {string} customNode  Custom node URL, overrides the 'network' argument
 * @returns {Promise<object>}   JSON-encoded response
 */
export function runPostQuery(network: string, command: string, payload = {}, customNode = ''): Promise<Response> {
    const url = getTezosNodeURL(network, command, customNode);
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
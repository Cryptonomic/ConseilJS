"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const FetchInstance_1 = __importDefault(require("./FetchInstance"));
const fetch = FetchInstance_1.default.getFetch();
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
function runGetQuery(server, command) {
    const url = `${server}/${command}`;
    console.log(`Querying Tezos node with URL ${url}`);
    return fetch(url, {
        method: 'get',
    })
        .then(response => { return response.json(); })
        .then(json => {
        console.log(`Reponse from Tezos node: ${JSON.stringify(json)}`);
        return new Promise(resolve => resolve(json));
    });
}
exports.runGetQuery = runGetQuery;
/**
 * Runs a query against a Tezos node.
 * TODO: Make blockchain agnostic
 * @param {string} server  Which Tezos node to go against
 * @param {string} command  RPC route to invoke
 * @param {object} payload  Payload to submit
 * @returns {Promise<object>}   JSON-encoded response
 */
function runPostQuery(server, command, payload = {}) {
    const url = `${server}/${command}`;
    const payloadStr = JSON.stringify(payload);
    console.log(`Querying Tezos node with URL ${url} and payload: ${payloadStr}`);
    return fetch(url, {
        method: 'post',
        body: payloadStr,
        headers: {
            'content-type': 'application/json',
        },
        credentials: 'include'
    });
}
exports.runPostQuery = runPostQuery;
//# sourceMappingURL=NautilusQuery.js.map
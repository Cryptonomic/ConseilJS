import * as TezosTypes from '../types/tezos/TezosChainTypes'
import FetchSelector from '../utils/FetchSelector'

const fetch = FetchSelector.getFetch();

/**
 * Utility functions for interacting with a Tezos node.
 */
export namespace TezosNode {
    /**
     * Send a GET request to a Tezos node.
     * 
     * @param {string} server Which Tezos node to go against
     * @param {string} command RPC route to invoke
     * @returns {Promise<object>} JSON-encoded response
     */
    function performGetRequest(server: string, command: string): Promise<object> {
        const url = `${server}/${command}`;

        return fetch(url, { method: 'get' })
            .then(response => response.json())
            .then(json => new Promise<Object>(resolve => resolve(json)));
    }

    /**
     * Send a POST request to a Tezos node.
     * 
     * @param {string} server Which Tezos node to go against
     * @param {string} command RPC route to invoke
     * @param {object} payload Payload to submit
     * @returns {Promise<object>} JSON-encoded response
     */
    function performPostRequest(server: string, command: string, payload = {}): Promise<Response> {
        const url = `${server}/${command}`;
        const payloadStr = JSON.stringify(payload);

        return fetch(url, {
            method: 'post',
            body: payloadStr,
            headers: { 'content-type': 'application/json' }
        });
    }

    /**
     * Gets a given block.
     * @param {string} server Which Tezos node to go against
     * @param {String} hash Hash of the given block
     * @returns {Promise<BlockMetadata>} Block
     */
    export function getBlock(server: string, hash: string): Promise<TezosTypes.BlockMetadata> {
        return performGetRequest(server, `chains/main/blocks/${hash}`)
            .then(json => {return <TezosTypes.BlockMetadata> json})
    }

    /**
     * Gets the block head.
     * @param {string} server Which Tezos node to go against
     * @returns {Promise<BlockMetadata>} Block head
     */
    export function getBlockHead(server: string): Promise<TezosTypes.BlockMetadata> {
        return getBlock(server, "head");
    }

    /**
     * Fetches a specific account for a given block.
     * @param {string} server  Which Tezos node to go against
     * @param {string} blockHash Hash of given block
     * @param {string} accountID Account ID
     * @returns {Promise<Account>} The account
     */
    export function getAccountForBlock(server: string, blockHash: string, accountID: string): Promise<TezosTypes.Account> {
        return performGetRequest(server, `chains/main/blocks/${blockHash}/context/contracts/${accountID}`)
            .then(json => <TezosTypes.Account> json);
    }

    /**
     * Fetches the manager of a specific account for a given block.
     * @param {string} server  Which Tezos node to go against
     * @param {string} blockHash Hash of given block
     * @param {string} accountID Account ID
     * @returns {Promise<ManagerKey>} The account
     */
    export function getAccountManagerForBlock(server: string, blockHash: string, accountID: string): Promise<TezosTypes.ManagerKey> {
        return performGetRequest(server, `chains/main/blocks/${blockHash}/context/contracts/${accountID}/manager_key`)
            .then(json => <TezosTypes.ManagerKey> json);
    }

    /**
     * Forge an operation group using the Tezos RPC client.
     * 
     * @param {string} server Which Tezos node to go against
     * @param {object} opGroup Operation group payload
     * @returns {Promise<string>} Forged operation
     */
    export async function forgeOperation(server: string, opGroup: object): Promise<string> {
        const response = await performPostRequest(server, "chains/main/blocks/head/helpers/forge/operations", opGroup);
        const forgedOperation = await response.text();

        return forgedOperation.replace(/\n/g, '').replace(/['"]+/g, '');
    }

    /**
     * Applies an operation using the Tezos RPC client.
     * 
     * @param {string} server Which Tezos node to go against
     * @param {object} payload Payload set according to protocol spec
     * @returns {Promise<AppliedOperation>} Applied operation
     */
    export async function applyOperation(server: string, payload: object): Promise<TezosTypes.AlphaOperationsWithMetadata[]> {
        const response  = await performPostRequest(server, 'chains/main/blocks/head/helpers/preapply/operations', payload);
        const json = await response.json();
        const appliedOperation = <TezosTypes.AlphaOperationsWithMetadata[]> json;

        return appliedOperation
    }

    /**
     *
     * @param {string} server Which Tezos node to go against
     * @param {object} payload Payload set according to protocol spec
     * @returns {Promise<InjectedOperation>} Injected operation
     */
    export async function injectOperation(server: string, payload: string): Promise<string> {
        const response = await performPostRequest(server, 'injection/operation?chain=main', payload);
        const injectedOperation = await response.text();

        return injectedOperation
    }
}
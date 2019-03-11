import * as TezosTypes from '../../types/tezos/TezosChainTypes'
import {ServiceRequestError, ServiceResponseError} from "../../types/conseil/ErrorTypes";
import FetchSelector from '../../utils/FetchSelector'

const fetch = FetchSelector.getFetch();

/**
 * Utility functions for interacting with a Tezos node.
 */
export namespace TezosNodeReader {
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
            .then(response => {
                if (!response.ok) { throw new ServiceRequestError(response.status, response.statusText, url, null); }
                return response;
            })
            .then(response => {
                try {
                    return response.json();
                } catch {
                    throw new ServiceResponseError(response.status, response.statusText, url, null, response);
                }
            });
    }

    /**
     * Gets a block for a given hash.
     * 
     * @param {string} server Which Tezos node to go against
     * @param {String} hash Hash of the given block
     * @returns {Promise<BlockMetadata>} Block
     */
    export function getBlock(server: string, hash: string): Promise<TezosTypes.BlockMetadata> {
        return performGetRequest(server, `chains/main/blocks/${hash}`)
            .then(json => {return <TezosTypes.BlockMetadata> json})
    }

    /**
     * Gets the top block.
     * @param {string} server Which Tezos node to go against
     * @returns {Promise<BlockMetadata>} Block head
     */
    export function getBlockHead(server: string): Promise<TezosTypes.BlockMetadata> {
        return getBlock(server, "head");
    }

    /**
     * Fetches a specific account for a given block.
     * 
     * @param {string} server Which Tezos node to go against
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
     * 
     * @param {string} server Which Tezos node to go against
     * @param {string} blockHash Hash of given block
     * @param {string} accountID Account ID
     * @returns {Promise<ManagerKey>} The account
     */
    export function getAccountManagerForBlock(server: string, blockHash: string, accountID: string): Promise<TezosTypes.ManagerKey> {
        return performGetRequest(server, `chains/main/blocks/${blockHash}/context/contracts/${accountID}/manager_key`)
            .then(json => <TezosTypes.ManagerKey> json);
    }
}

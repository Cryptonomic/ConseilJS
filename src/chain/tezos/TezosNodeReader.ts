import * as TezosTypes from '../../types/tezos/TezosChainTypes'
import {KeyStore} from "../../types/wallet/KeyStore";
import {ServiceRequestError} from "../../types/conseil/ErrorTypes";
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
            .then(response => response.json());
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

    /**
     * Indicates whether an account is implicit and empty. If true, transaction will burn 0.257tz.
     *
     * @param {string} server Tezos node to connect to
     * @param {string} accountHash Account address
     * @returns {Promise<boolean>} Result
     */
    export async function isImplicitAndEmpty(server: string, accountHash: string): Promise<boolean> {
        const blockHead = await TezosNodeReader.getBlockHead(server);
        const account = await TezosNodeReader.getAccountForBlock(server, blockHead.hash, accountHash);

        const isImplicit = accountHash.toLowerCase().startsWith("tz");
        const isEmpty = Number(account.balance) === 0

        return (isImplicit && isEmpty)
    }

    /**
     * Indicates whether a reveal operation has already been done for a given account.
     *
     * @param {string} server Tezos node to connect to
     * @param {KeyStore} keyStore Key pair along with public key hash
     * @returns {Promise<boolean>} Result
     */
    export async function isManagerKeyRevealedForAccount(server: string, keyStore: KeyStore): Promise<boolean> {
        const blockHead = await TezosNodeReader.getBlockHead(server);
        const managerKey = await TezosNodeReader.getAccountManagerForBlock(server, blockHead.hash, keyStore.publicKeyHash);

        return managerKey.key != null;
    }
}

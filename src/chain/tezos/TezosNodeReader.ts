import * as TezosRPCTypes from '../../types/tezos/TezosRPCResponseTypes'
import {ServiceRequestError} from '../../types/conseil/ErrorTypes';
import FetchSelector from '../../utils/FetchSelector'
import LogSelector from '../../utils/LoggerSelector';

const log = LogSelector.getLogger();
const fetch = FetchSelector.getFetch();

/**
 * Utility functions for interacting with a Tezos node.
 */
export namespace TezosNodeReader {
    /**
     * Send a GET request to a Tezos node.
     * 
     * @param {string} server Tezos node to query
     * @param {string} command RPC route to invoke
     * @returns {Promise<object>} JSON-encoded response
     */
    function performGetRequest(server: string, command: string): Promise<object> {
        const url = `${server}/${command}`;

        return fetch(url, { method: 'get' })
            .then(response => {
                if (!response.ok) {
                    log.error(`TezosNodeReader.performGetRequest error: ${response.status} for ${command} on ${server}`);
                    throw new ServiceRequestError(response.status, response.statusText, url, null);
                }
                return response;
            })
            .then(response => {
                const json: any = response.json();
                log.debug(`TezosNodeReader.performGetRequest response: ${json} for ${command} on ${server}`);
                return json;
            });
    }

    /**
     * Gets a block for a given hash.
     * 
     * @param {string} server Tezos node to query
     * @param {String} hash Hash of the given block
     * @returns {Promise<TezosRPCTypes.TezosBlock>} Block
     */
    export function getBlock(server: string, hash: string): Promise<TezosRPCTypes.TezosBlock> {
        return performGetRequest(server, `chains/main/blocks/${hash}`).then(json => { return <TezosRPCTypes.TezosBlock> json });
    }

    /**
     * Gets the top block.
     * 
     * @param {string} server Tezos node to query
     * @returns {Promise<TezosRPCTypes.TezosBlock>} Block head
     */
    export function getBlockHead(server: string): Promise<TezosRPCTypes.TezosBlock> {
        return getBlock(server, 'head');
    }

    /**
     * Fetches a specific account for a given block.
     * 
     * @param {string} server Tezos node to query
     * @param {string} blockHash Hash of given block
     * @param {string} accountHash Account address
     * @returns {Promise<Account>} The account
     */
    export function getAccountForBlock(server: string, blockHash: string, accountHash: string): Promise<TezosRPCTypes.Contract> {
        return performGetRequest(server, `chains/main/blocks/${blockHash}/context/contracts/${accountHash}`)
            .then(json => <TezosRPCTypes.Contract> json);
    }

    /**
     * Fetches the current counter for an account.
     * 
     * @param {string} server Tezos node to query
     * @param {string} accountHash Account address
     * @returns {Promise<number>} Current account counter
     */
    export async function getCounterForAccount(server: string, accountHash: string): Promise<number> {
        const blockHash = (await getBlockHead(server)).hash;
        const account = await performGetRequest(server, `chains/main/blocks/${blockHash}/context/contracts/${accountHash}`).then(json => <TezosRPCTypes.Contract> json);
        return parseInt(account.counter.toString(), 10);
    }

    /**
     * Fetches the manager of a specific account for a given block.
     * 
     * @param {string} server Tezos node to query
     * @param {string} blockHash Hash of given block
     * @param {string} accountHash Account address
     * @returns {Promise<TezosRPCTypes.ManagerKey>} The account
     */
    export function getAccountManagerForBlock(server: string, blockHash: string, accountHash: string): Promise<TezosRPCTypes.ManagerKey> {
        return performGetRequest(server, `chains/main/blocks/${blockHash}/context/contracts/${accountHash}/manager_key`)
            .then(json => <TezosRPCTypes.ManagerKey> json);
    }

    /**
     * Indicates whether an account is implicit and empty. If true, transaction will burn 0.257tz.
     *
     * @param {string} server Tezos node to connect to
     * @param {string} accountHash Account address
     * @returns {Promise<boolean>} Result
     */
    export async function isImplicitAndEmpty(server: string, accountHash: string): Promise<boolean> {
        const blockHead = await getBlockHead(server);
        const account = await getAccountForBlock(server, blockHead.hash, accountHash);

        const isImplicit = accountHash.toLowerCase().startsWith('tz');
        const isEmpty = Number(account.balance) === 0;

        return (isImplicit && isEmpty);
    }

    /**
     * Indicates whether a reveal operation has already been done for a given account.
     *
     * @param {string} server Tezos node to connect to
     * @param {string} accountHash Account address to delegate from
     * @returns {Promise<boolean>} Result
     */
    export async function isManagerKeyRevealedForAccount(server: string, accountHash: string): Promise<boolean> {
        const blockHead = await getBlockHead(server);
        const managerKey = await getAccountManagerForBlock(server, blockHead.hash, accountHash);

        return managerKey.key != null;
    }
}

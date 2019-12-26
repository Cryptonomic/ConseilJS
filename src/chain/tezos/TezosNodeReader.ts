import * as TezosRPCTypes from '../../types/tezos/TezosRPCResponseTypes'
import { TezosRequestError } from '../../types/tezos/TezosErrorTypes';
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
                    throw new TezosRequestError(response.status, response.statusText, url, null);
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
     * @param {string} hash Hash of the given block, defaults to 'head'
     * @param {string} chainid Chain id, expected to be 'main' or 'test', defaults to main
     * @returns {Promise<TezosRPCTypes.TezosBlock>} Block
     */
    export function getBlock(server: string, hash: string = 'head', chainid: string = 'main'): Promise<TezosRPCTypes.TezosBlock> {
        return performGetRequest(server, `chains/${chainid}/blocks/${hash}`).then(json => { return <TezosRPCTypes.TezosBlock> json });
    }

    /**
     * Gets the top block.
     * 
     * @param {string} server Tezos node to query
     * @returns {Promise<TezosRPCTypes.TezosBlock>} Block head
     */
    export function getBlockHead(server: string): Promise<TezosRPCTypes.TezosBlock> {
        return getBlock(server);
    }

    /**
     * Fetches a specific account for a given block.
     * 
     * @param {string} server Tezos node to query
     * @param {string} blockHash Hash of given block
     * @param {string} accountHash Account address
     * @param {string} chainid Chain id, expected to be 'main' or 'test', defaults to main
     * @returns {Promise<Account>} The account
     */
    export function getAccountForBlock(server: string, blockHash: string, accountHash: string, chainid: string = 'main'): Promise<TezosRPCTypes.Contract> {
        return performGetRequest(server, `chains/${chainid}/blocks/${blockHash}/context/contracts/${accountHash}`)
            .then(json => <TezosRPCTypes.Contract> json);
    }

    /**
     * Fetches the current counter for an account.
     * 
     * @param {string} server Tezos node to query
     * @param {string} accountHash Account address
     * @param {string} chainid Chain id, expected to be 'main' or 'test', defaults to main
     * @returns {Promise<number>} Current account counter
     */
    export async function getCounterForAccount(server: string, accountHash: string, chainid: string = 'main'): Promise<number> {
        const counter = await performGetRequest(server, `chains/${chainid}/blocks/head/context/contracts/${accountHash}/counter`)
            .then(r => r.toString());
        return parseInt(counter.toString(), 10);
    }

    /**
     * Returns account balance as of the Head. Will return current balance or 0 if the account is marked as `spendable: false`.
     * Use `getAccountForBlock()` to get balance as of a specific block. Balance value is in utez.
     * 
     * @param {string} server Tezos node to query
     * @param {string} accountHash Account address
     * @param chainid Chain id, expected to be 'main' or 'test', defaults to main
     */
    export async function getSpendableBalanceForAccount(server: string, accountHash: string, chainid: string = 'main'): Promise<number> {
        const account = await performGetRequest(server, `chains/${chainid}/blocks/head/context/contracts/${accountHash}`)
            .then(json => <TezosRPCTypes.Contract> json);
        return parseInt(account.balance.toString(), 10); 
    }

    /**
     * Fetches the manager public key of a specific account for a given block.
     * 
     * @param {string} server Tezos node to query
     * @param {string} blockHash Hash of given block
     * @param {string} accountHash Account address
     * @param {string} chainid Chain id, expected to be 'main' or 'test', defaults to main.
     * @returns {Promise<string>} Manager public key
     */
    export function getAccountManagerForBlock(server: string, blockHash: string, accountHash: string, chainid: string = 'main'): Promise<string> {
        return performGetRequest(server, `chains/${chainid}/blocks/${blockHash}/context/contracts/${accountHash}/manager_key`)
            .then(result => result ? result.toString() : '');
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

        return managerKey.length > 0;
    }
}

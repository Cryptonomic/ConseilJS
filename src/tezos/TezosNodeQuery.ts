import * as Nautilus from '../utils/NautilusQuery'
import * as TezosTypes from './TezosTypes'
import {BlockMetadata} from "./TezosTypes";

/**
 * Utility functions for interacting with the Tezos node.
 */

/**
 * Gets a given block.
 * @param {string} network  Which Tezos network to go against
 * @param {String} hash Hash of the given block
 * @returns {Promise<BlockMetadata>}    Block
 */
export function getBlock(network: string, hash: string): Promise<BlockMetadata> {
    return Nautilus.runGetQuery(network, `/chains/main/blocks/${hash}`)
        .then(json => {return <TezosTypes.BlockMetadata> json})
}

/**
 * Gets the block head.
 * @param {string} network  Which Tezos network to go against
 * @returns {Promise<BlockMetadata>}    Block head
 */
export function getBlockHead(network: string): Promise<TezosTypes.BlockMetadata> {
    return getBlock(network, "head")
}

/**
 * Fetches a specific account for a given block.
 * @param {string} network  Which Tezos network to go against
 * @param {string} blockHash    Hash of given block
 * @param {string} accountID    Account ID
 * @returns {Promise<Account>}  The account
 */
export function getAccountForBlock(network: string, blockHash: string, accountID: string): Promise<TezosTypes.Account> {
    return Nautilus.runGetQuery(network, `/chains/main/blocks/${blockHash}/context/contracts/${accountID}`)
        .then(json => {return <TezosTypes.Account> json})
}

/**
 * Fetches the manager of a specific account for a given block.
 * @param {string} network  Which Tezos network to go against
 * @param {string} blockHash    Hash of given block
 * @param {string} accountID    Account ID
 * @returns {Promise<ManagerKey>}   The account
 */
export function getAccountManagerForBlock(network: string, blockHash: string, accountID: string): Promise<TezosTypes.ManagerKey> {
    return Nautilus.runGetQuery(network, `/chains/main/blocks/${blockHash}/context/contracts/${accountID}/manager_key`)
        .then(json => {return <TezosTypes.ManagerKey> json})
}

/**
 * Forge an operation group using the Tezos RPC client.
 * @param {string} network  Which Tezos network to go against
 * @param {object} opGroup  Operation group payload
 * @returns {Promise<ForgedOperation>}  Forged operation
 */
export async function forgeOperation(network: string, opGroup: object): Promise<string> {
    const response = await Nautilus.runPostQuery(
        network,
        "/chains/main/blocks/head/helpers/forge/operations",
        opGroup
    )
    const forgedOperation = await response.text()
    console.log('Forged operation:')
    console.log(forgedOperation)
    return forgedOperation
        .replace(/\n/g, '')
        //.replace('\"', '')
        .replace(/['"]+/g, '')

}

/**
 * Applies an operation using the Tezos RPC client.
 * @param {string} network  Which Tezos network to go against
 * @param {object} payload  Payload set according to protocol spec
 * @returns {Promise<AppliedOperation>} Applied operation
 */
export async function applyOperation(network: string, payload: object): Promise<TezosTypes.AppliedOperation> {
    const response  = await Nautilus.runPostQuery(
        network,
        `/chains/main/blocks/head/helpers/preapply/operations`,
        payload
    )
    const json = await response.json()
    const appliedOperation =  <TezosTypes.AppliedOperation> json
    console.log('Applied operation:')
    console.log(appliedOperation)
    return appliedOperation
}

/**
 *
 * @param {string} network  Which Tezos network to go against
 * @param {object} payload  Payload set according to protocol spec
 * @returns {Promise<InjectedOperation>} Injected operation
 */
export async function injectOperation(network: string, payload: string): Promise<string> {
    const response = await Nautilus.runPostQuery(
        network,
        `injection/operation?chain=main`,
        payload
    )
    const injectedOperation = await response.text()
    console.log('Injected operation')
    console.log(">>", injectedOperation)
    return injectedOperation
}
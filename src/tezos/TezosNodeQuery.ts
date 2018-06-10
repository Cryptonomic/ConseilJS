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
    return Nautilus.runQuery(network, `blocks/${hash}`)
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
    return Nautilus.runQuery(network, `blocks/${blockHash}/proto/context/contracts/${accountID}`)
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
    return Nautilus.runQuery(network, `blocks/${blockHash}/proto/context/contracts/${accountID}/manager_key`)
        .then(json => {return <TezosTypes.ManagerKey> json})
}

/**
 * Forge an operation group using the Tezos RPC client.
 * @param {string} network  Which Tezos network to go against
 * @param {object} opGroup  Operation group payload
 * @returns {Promise<ForgedOperation>}  Forged operation
 */
export function forgeOperation(network: string, opGroup: object): Promise<TezosTypes.ForgedOperation> {
    return Nautilus.runQuery(
        network,
        "/blocks/head/proto/helpers/forge/operations",
        opGroup
    )
        .then(json => {return <TezosTypes.ForgedOperation> json})
}

/**
 * Applies an operation using the Tezos RPC client.
 * @param {string} network  Which Tezos network to go against
 * @param {object} payload  Payload set according to protocol spec
 * @returns {Promise<AppliedOperation>} Applied operation
 */
export function applyOperation(network: string, payload: object): Promise<TezosTypes.AppliedOperation> {
    return Nautilus.runQuery(
        network,
        `/blocks/head/proto/helpers/apply_operation`,
        payload
    )
        .then(json => {return <TezosTypes.AppliedOperation> json})
}

/**
 *
 * @param {string} network  Which Tezos network to go against
 * @param {object} payload  Payload set according to protocol spec
 * @returns {Promise<InjectedOperation>} Injected operation
 */
export function injectOperation(network: string, payload: object): Promise<TezosTypes.InjectedOperation> {
    return Nautilus.runQuery(
        network,
        `/inject_operation`,
        payload
    )
        .then(json => {return <TezosTypes.InjectedOperation> json})
}
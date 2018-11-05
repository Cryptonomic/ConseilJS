import * as TezosTypes from './TezosTypes';
import { BlockMetadata } from "./TezosTypes";
/**
 * Utility functions for interacting with the Tezos node.
 */
export declare namespace TezosNode {
    /**
     * Gets a given block.
     * @param {string} server  Which Tezos node to go against
     * @param {String} hash Hash of the given block
     * @returns {Promise<BlockMetadata>}    Block
     */
    function getBlock(server: string, hash: string): Promise<BlockMetadata>;
    /**
     * Gets the block head.
     * @param {string} server  Which Tezos node to go against
     * @returns {Promise<BlockMetadata>}    Block head
     */
    function getBlockHead(server: string): Promise<TezosTypes.BlockMetadata>;
    /**
     * Fetches a specific account for a given block.
     * @param {string} server  Which Tezos node to go against
     * @param {string} blockHash    Hash of given block
     * @param {string} accountID    Account ID
     * @returns {Promise<Account>}  The account
     */
    function getAccountForBlock(server: string, blockHash: string, accountID: string): Promise<TezosTypes.Account>;
    /**
     * Fetches the manager of a specific account for a given block.
     * @param {string} server  Which Tezos node to go against
     * @param {string} blockHash    Hash of given block
     * @param {string} accountID    Account ID
     * @returns {Promise<ManagerKey>}   The account
     */
    function getAccountManagerForBlock(server: string, blockHash: string, accountID: string): Promise<TezosTypes.ManagerKey>;
    /**
     * Forge an operation group using the Tezos RPC client.
     * @param {string} server  Which Tezos node to go against
     * @param {object} opGroup  Operation group payload
     * @returns {Promise<string>}  Forged operation
     */
    function forgeOperation(server: string, opGroup: object): Promise<string>;
    /**
     * Applies an operation using the Tezos RPC client.
     * @param {string} server  Which Tezos node to go against
     * @param {object} payload  Payload set according to protocol spec
     * @returns {Promise<AppliedOperation>} Applied operation
     */
    function applyOperation(server: string, payload: object): Promise<TezosTypes.AlphaOperationsWithMetadata[]>;
    /**
     *
     * @param {string} server  Which Tezos node to go against
     * @param {object} payload  Payload set according to protocol spec
     * @returns {Promise<InjectedOperation>} Injected operation
     */
    function injectOperation(server: string, payload: string): Promise<string>;
}

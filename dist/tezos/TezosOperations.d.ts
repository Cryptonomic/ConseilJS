/// <reference types="node" />
import { KeyStore } from "../types/KeyStore";
import * as TezosTypes from "./TezosTypes";
import { Operation } from "./TezosTypes";
/**
 *  Functions for sending operations on the Tezos network.
 */
/**
 * Output of operation signing.
 */
export interface SignedOperationGroup {
    bytes: Buffer;
    signature: string;
}
/**
 * Result of a successfully sent operation
 */
export interface OperationResult {
    results: TezosTypes.AlphaOperationsWithMetadata;
    operationGroupID: String;
}
export declare namespace TezosOperations {
    /**
     * Signs a forged operation
     * @param {string} forgedOperation  Forged operation group returned by the Tezos client (as a hex string)
     * @param {KeyStore} keyStore   Key pair along with public key hash
     * @param {string} derivationPath BIP44 Derivation Path if signed with hardware, empty if signed with software
     * @returns {SignedOperationGroup}  Bytes of the signed operation along with the actual signature
     */
    function signOperationGroup(forgedOperation: string, keyStore: KeyStore, derivationPath: string): Promise<SignedOperationGroup>;
    /**
     * Computes the ID of an operation group using Base58Check.
     * @param {SignedOperationGroup} signedOpGroup  Signed operation group
     * @returns {string}    Base58Check hash of signed operation
     */
    function computeOperationHash(signedOpGroup: SignedOperationGroup): string;
    /**
     * Forge an operation group using the Tezos RPC client.
     * @param {string} network  Which Tezos network to go against
     * @param {BlockMetadata} blockHead The block head
     * @param {object[]} operations The operations being forged as part of this operation group
     * @returns {Promise<string>}   Forged operation bytes (as a hex string)
     */
    function forgeOperations(network: string, blockHead: TezosTypes.BlockMetadata, operations: object[]): Promise<string>;
    /**
     * Applies an operation using the Tezos RPC client.
     * @param {string} network  Which Tezos network to go against
     * @param {BlockMetadata} blockHead Block head
     * @param {object[]} operations The operations to create and send
     * @param {string} operationGroupHash   Hash of the operation group being applied (in Base58Check format)
     * @param {string} forgedOperationGroup Forged operation group returned by the Tezos client (as a hex string)
     * @param {SignedOperationGroup} signedOpGroup  Signed operation group
     * @returns {Promise<AppliedOperation>} Array of contract handles
     */
    function applyOperation(network: string, blockHead: TezosTypes.BlockMetadata, operations: object[], operationGroupHash: string, forgedOperationGroup: string, signedOpGroup: SignedOperationGroup): Promise<TezosTypes.AlphaOperationsWithMetadata[]>;
    /**
     * Injects an opertion using the Tezos RPC client.
     * @param {string} network  Which Tezos network to go against
     * @param {SignedOperationGroup} signedOpGroup  Signed operation group
     * @returns {Promise<InjectedOperation>}    ID of injected operation
     */
    function injectOperation(network: string, signedOpGroup: SignedOperationGroup): Promise<string>;
    /**
     * Master function for creating and sending all supported types of operations.
     * @param {string} network  Which Tezos network to go against
     * @param {object[]} operations The operations to create and send
     * @param {KeyStore} keyStore   Key pair along with public key hash
     * @param {string} derivationPath BIP44 Derivation Path if signed with hardware, empty if signed with software
     * @returns {Promise<OperationResult>}  The ID of the created operation group
     */
    function sendOperation(network: string, operations: object[], keyStore: KeyStore, derivationPath: any): Promise<OperationResult>;
    /**
     * Helper function for sending Delegations, Transactions, and Originations.
     * Checks if manager's public key has been revealed for operation. If yes,
     * do nothing, else, bundle a reveal operation before the input operation.
     * @param network Which Tezos network to go against
     * @param keyStore  Key pair along with public key hash
     * @param fee Fee to use
     * @param account Which account to use
     * @param operations Delegation, Transaction, or Origination to possibly bundle with a reveal
     */
    function appendRevealOperation(network: string, keyStore: KeyStore, account: TezosTypes.Account, operations: Operation[]): Promise<TezosTypes.Operation[]>;
    /**
     * Creates and sends a transaction operation.
     * @param {string} network  Which Tezos network to go against
     * @param {KeyStore} keyStore   Key pair along with public key hash
     * @param {String} to   Destination public key hash
     * @param {number} amount   Amount to send
     * @param {number} fee  Fee to use
     * @param {string} derivationPath BIP44 Derivation Path if signed with hardware, empty if signed with software
     * @returns {Promise<OperationResult>}  Result of the operation
     */
    function sendTransactionOperation(network: string, keyStore: KeyStore, to: String, amount: number, fee: number, derivationPath: string): Promise<OperationResult>;
    /**
     * Creates and sends a delegation operation.
     * @param {string} network  Which Tezos network to go against
     * @param {KeyStore} keyStore   Key pair along with public key hash
     * @param {String} delegate Account ID to delegate to
     * @param {number} fee  Operation fee
     * @param {string} derivationPath BIP44 Derivation Path if signed with hardware, empty if signed with software
     * @returns {Promise<OperationResult>}  Result of the operation
     */
    function sendDelegationOperation(network: string, keyStore: KeyStore, delegate: String, fee: number, derivationPath: string): Promise<OperationResult>;
    /**
     * Creates and sends an origination operation.
     * @param {string} network  Which Tezos network to go against
     * @param {KeyStore} keyStore   Key pair along with public key hash
     * @param {number} amount   Initial funding amount of new account
     * @param {string} delegate Account ID to delegate to, blank if none
     * @param {boolean} spendable   Is account spendable?
     * @param {boolean} delegatable Is account delegatable?
     * @param {number} fee  Operation fee
     * @param {string} derivationPath BIP44 Derivation Path if signed with hardware, empty if signed with software
     * @returns {Promise<OperationResult>}  Result of the operation
     */
    function sendOriginationOperation(network: string, keyStore: KeyStore, amount: number, delegate: string, spendable: boolean, delegatable: boolean, fee: number, derivationPath: string): Promise<OperationResult>;
    /**
     * Indicates whether an account is implicit and empty. If true, transaction will burn 0.257tz.
     * @param {string} network  Which Tezos network to go against
     * @param {KeyStore} keyStore   Key pair along with public key hash
     * @returns {Promise<boolean>}  Result
     */
    function isImplicitAndEmpty(network: string, keyStore: KeyStore): Promise<boolean>;
    /**
     * Indicates whether a reveal operation has already been done for a given account.
     * @param {string} network  Which Tezos network to go against
     * @param {KeyStore} keyStore   Key pair along with public key hash
     * @returns {Promise<boolean>}  Result
     */
    function isManagerKeyRevealedForAccount(network: string, keyStore: KeyStore): Promise<boolean>;
    /**
     * Creates and sends a reveal operation.
     * @param {string} network  Which Tezos network to go against
     * @param {KeyStore} keyStore   Key pair along with public key hash
     * @param {number} fee  Fee to pay
     * @param {string} derivationPath BIP44 Derivation Path if signed with hardware, empty if signed with software
     * @returns {Promise<OperationResult>}  Result of the operation
     */
    function sendKeyRevealOperation(network: string, keyStore: KeyStore, fee: number, derivationPath: string): Promise<OperationResult>;
    /**
     * Creates and sends an activation operation.
     * @param {string} network  Which Tezos network to go against
     * @param {KeyStore} keyStore   Key pair along with public key hash
     * @param {string} activationCode   Activation code provided by fundraiser process
     * @param {string} derivationPath BIP44 Derivation Path if signed with hardware, empty if signed with software
     * @returns {Promise<OperationResult>}  Result of the operation
     */
    function sendIdentityActivationOperation(network: string, keyStore: KeyStore, activationCode: string, derivationPath: string): Promise<OperationResult>;
}

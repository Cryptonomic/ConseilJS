import sodium = require('libsodium-wrappers');
import * as CryptoUtils from '../utils/CryptoUtils';
import {KeyStore} from "../types/KeyStore";
import * as TezosNode from "./TezosNodeQuery"
import * as TezosTypes from "./TezosTypes"

/**
 *  Functions for sending operations on the Tezos network.
 */

/**
 * Output of operation signing.
 */
export interface SignedOperationGroup {
    bytes: Buffer,
    signature: string
}

/**
 * Result of a successfully sent operation
 */
export interface OperationResult {
    results: TezosTypes.AppliedOperation,
    operationGroupID: String
}

/**
 * Signs a forged operation
 * @param {string} forgedOperation  Forged operation group returned by the Tezos client (as a hex string)
 * @param {KeyStore} keyStore   Key pair along with public key hash
 * @returns {SignedOperationGroup}  Bytes of the signed operation along with the actual signature
 */
export function signOperationGroup(forgedOperation: string, keyStore: KeyStore): SignedOperationGroup {
    const watermark = '03';
    const watermarkedForgedOperationBytes: Buffer = sodium.from_hex(watermark + forgedOperation);
    const privateKeyBytes: Buffer = CryptoUtils.base58CheckDecode(keyStore.privateKey, "edsk");
    const hashedWatermarkedOpBytes: Buffer = sodium.crypto_generichash(32, watermarkedForgedOperationBytes);
    const opSignature: Buffer = sodium.crypto_sign_detached(hashedWatermarkedOpBytes, privateKeyBytes);
    const hexSignature: string = CryptoUtils.base58CheckEncode(opSignature, "edsig").toString();
    const signedOpBytes: Buffer = Buffer.concat([sodium.from_hex(forgedOperation), opSignature]);
    return {
        bytes: signedOpBytes,
        signature: hexSignature.toString()
    }
}

/**
 * Computes the ID of an operation group using Base58Check.
 * @param {SignedOperationGroup} signedOpGroup  Signed operation group
 * @returns {string}    Base58Check hash of signed operation
 */
export function computeOperationHash(signedOpGroup: SignedOperationGroup): string {
    const hash: Buffer = sodium.crypto_generichash(32, signedOpGroup.bytes);
    return CryptoUtils.base58CheckEncode(hash, "op")
}

/**
 * Appends a key reveal operation to an operation group if needed.
 * @param {object[]} operations The operations being forged as part of this operation group
 * @param {ManagerKey} managerKey   The sending account's manager information
 * @param {KeyStore} keyStore   Key pair along with public key hash
 * @param {isManager}    Is this a manager operation?
 * @returns {object[]}  Operation group enriched with a key reveal if necessary
 */
export function handleKeyRevealForOperations(
    operations: object[],
    managerKey: TezosTypes.ManagerKey,
    keyStore: KeyStore,
    isManager: boolean): object[] {
    if(isManager && managerKey.key === null) {
        const revealOp: object = {
            kind: "reveal",
            public_key: keyStore.publicKey
        };
        return [revealOp].concat(operations)
    }
    else {
        return operations
    }
}

/**
 * Forge an operation group using the Tezos RPC client.
 * @param {string} network  Which Tezos network to go against
 * @param {BlockMetadata} blockHead The block head
 * @param {Account} account The sender's account
 * @param {object[]} operations The operations being forged as part of this operation group
 * @param {KeyStore} keyStore   Key pair along with public key hash
 * @param {number} fee  Fee to be paid
 * @param {isManager}    Is this a manager operation?
 * @returns {Promise<string>}   Forged operation bytes (as a hex string)
 */
export async function forgeOperations(
    network: string,
    blockHead: TezosTypes.BlockMetadata,
    operations: object[]): Promise<string> {
    const payload = {
            branch: blockHead.hash,
            contents: operations
        }
    return TezosNode.forgeOperation(network, payload)
}

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
export function applyOperation(
    network: string,
    blockHead: TezosTypes.BlockMetadata,
    operations: object[],
    operationGroupHash: string,
    forgedOperationGroup: string,
    signedOpGroup: SignedOperationGroup): Promise<TezosTypes.AppliedOperation> {
    const payload = [{
        protocol: blockHead.protocol,
        branch: blockHead.hash,
        contents: operations,
        signature: signedOpGroup.signature
    }];
    return TezosNode.applyOperation(network, payload)
}

/**
 * Injects an opertion using the Tezos RPC client.
 * @param {string} network  Which Tezos network to go against
 * @param {SignedOperationGroup} signedOpGroup  Signed operation group
 * @returns {Promise<InjectedOperation>}    ID of injected operation
 */
export function injectOperation(
    network: string,
    signedOpGroup: SignedOperationGroup): Promise<string> {
    const payload = sodium.to_hex(signedOpGroup.bytes)
    return TezosNode.injectOperation(network, payload)
}

/**
 * Master function for creating and sending all supported types of operations.
 * @param {string} network  Which Tezos network to go against
 * @param {object[]} operations The operations to create and send
 * @param {KeyStore} keyStore   Key pair along with public key hash
 * @param {isManager}    Is this a manager operation?
 * @returns {Promise<OperationResult>}  The ID of the created operation group
 */
export async function sendOperation(
    network: string,
    operations: object[],
    keyStore: KeyStore,
    isManager = true): Promise<OperationResult>   {
    const blockHead = await TezosNode.getBlockHead(network);
    const accountManager = await TezosNode.getAccountManagerForBlock(network, blockHead.hash, keyStore.publicKeyHash);
    const operationsWithKeyReveal = handleKeyRevealForOperations(operations, accountManager, keyStore, isManager);
    const forgedOperationGroup = await forgeOperations(network, blockHead, operationsWithKeyReveal);
    const signedOpGroup = signOperationGroup(forgedOperationGroup, keyStore);
    const operationGroupHash = computeOperationHash(signedOpGroup);
    const appliedOp = await applyOperation(network, blockHead, operations, operationGroupHash, forgedOperationGroup, signedOpGroup);
    const injectedOperation = await injectOperation(network, signedOpGroup);
    return {
        results: appliedOp,
        operationGroupID: injectedOperation
    }
}

/**
 * Creates and sends a transaction operation.
 * @param {string} network  Which Tezos network to go against
 * @param {KeyStore} keyStore   Key pair along with public key hash
 * @param {String} to   Destination public key hash
 * @param {number} amount   Amount to send
 * @param {number} fee  Fee to use
 * @returns {Promise<OperationResult>}  Result of the operation
 */
export async function sendTransactionOperation(
    network: string,
    keyStore: KeyStore,
    to: String,
    amount: number,
    fee: number
) {
    const blockHead = await TezosNode.getBlockHead(network);
    const account = await TezosNode.getAccountForBlock(network, blockHead.hash, keyStore.publicKeyHash);
    const transaction = {
        destination: to,
        amount: amount.toString(),
        storage_limit: '0',
        gas_limit: '120',
        counter: account.counter,
        fee: fee.toString(),
        source: keyStore.publicKeyHash,
        kind:   "transaction",
        parameters: {prim: "Unit", args: []}
    };
    const operations = [transaction];
    return sendOperation(network, operations, keyStore, true)
}

/**
 * Creates and sends a delegation operation.
 * @param {string} network  Which Tezos network to go against
 * @param {KeyStore} keyStore   Key pair along with public key hash
 * @param {String} delegate Account ID to delegate to
 * @param {number} fee  Operation fee
 * @returns {Promise<OperationResult>}  Result of the operation
 */
export async function sendDelegationOperation(
    network: string,
    keyStore: KeyStore,
    delegate: String,
    fee: number
) {
    const blockHead = await TezosNode.getBlockHead(network);
    const account = await TezosNode.getAccountForBlock(network, blockHead.hash, keyStore.publicKeyHash);
    const delegation = {
        kind:   "delegation",
        source: keyStore.publicKeyHash,
        fee: fee.toString(),
        counter: account.counter,
        gas_limit: '120',
        storage_limit: '0',
        delegate: delegate,
    };
    const operations = [delegation];
    return sendOperation(network, operations, keyStore, true)
}

/**
 * Creates and sends an origination operation.
 * @param {string} network  Which Tezos network to go against
 * @param {KeyStore} keyStore   Key pair along with public key hash
 * @param {number} amount   Initial funding amount of new account
 * @param {string} delegate Account ID to delegate to, blank if none
 * @param {boolean} spendable   Is account spendable?
 * @param {boolean} delegatable Is account delegatable?
 * @param {number} fee  Operation fee
 * @returns {Promise<OperationResult>}  Result of the operation
 */
export async function sendOriginationOperation(
    network: string,
    keyStore: KeyStore,
    amount: number,
    delegate: string,
    spendable: boolean,
    delegatable: boolean,
    fee: number
) {
    const blockHead = await TezosNode.getBlockHead(network);
    const account = await TezosNode.getAccountForBlock(network, blockHead.hash, keyStore.publicKeyHash);
    const origination = {
        kind:   "origination",
        source: keyStore.publicKeyHash,
        fee: fee.toString(),
        counter: account.counter,
        gas_limit: '120',
        storage_limit: '0',
        managerPubkey: keyStore.publicKeyHash,
        balance: amount.toString(),
        spendable: spendable,
        delegatable: delegatable,
        delegate: delegate
    };
    const operations = [origination];
    return sendOperation(network, operations, keyStore, true)
}

export function sendIdentityActivationOperation(
    network: string,
    keyStore: KeyStore,
    activationCode: string
) {
    const activation = {
        kind:   "activate_account",
        pkh:    keyStore.publicKeyHash,
        secret: activationCode
    };
    const operations = [activation];
    return sendOperation(network, operations, keyStore, false)
}
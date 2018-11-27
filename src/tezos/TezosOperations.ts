import sodium = require('libsodium-wrappers');
import * as CryptoUtils from '../utils/CryptoUtils';
import * as LedgerUtils from '../utils/LedgerUtils';
import {KeyStore, StoreType} from "../types/KeyStore";
import {TezosNode} from "./TezosNodeQuery";
import * as TezosTypes from "./TezosTypes";
import {Operation} from "./TezosTypes";

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
    results: TezosTypes.AlphaOperationsWithMetadata,
    operationGroupID: String
}

export namespace TezosOperations {

    /**
     * Signs a forged operation
     * @param {string} forgedOperation  Forged operation group returned by the Tezos client (as a hex string)
     * @param {KeyStore} keyStore   Key pair along with public key hash
     * @param {string} derivationPath BIP44 Derivation Path if signed with hardware, empty if signed with software
     * @returns {SignedOperationGroup}  Bytes of the signed operation along with the actual signature
     */
    export async function signOperationGroup(
        forgedOperation: string,
        keyStore: KeyStore,
        derivationPath: string): Promise<SignedOperationGroup> {
        const watermark = '03';
        const watermarkedForgedOperationBytesHex: string = watermark + forgedOperation;

        let opSignature: Buffer = new Buffer(0);
        switch(keyStore.storeType) {
            case StoreType.Hardware:
                opSignature = await LedgerUtils.signTezosOperation(derivationPath, watermarkedForgedOperationBytesHex);
                break;
            default:
                const watermarkedForgedOperationBytes: Buffer = sodium.from_hex(watermarkedForgedOperationBytesHex);
                const hashedWatermarkedOpBytes: Buffer = sodium.crypto_generichash(32, watermarkedForgedOperationBytes);
                const privateKeyBytes: Buffer = CryptoUtils.base58CheckDecode(keyStore.privateKey, "edsk");
                opSignature = sodium.crypto_sign_detached(hashedWatermarkedOpBytes, privateKeyBytes);
        }

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
     * Forge an operation group using the Tezos RPC client.
     * @param {string} network  Which Tezos network to go against
     * @param {BlockMetadata} blockHead The block head
     * @param {object[]} operations The operations being forged as part of this operation group
     * @returns {Promise<string>}   Forged operation bytes (as a hex string)
     */
    export async function forgeOperations(
        network: string,
        blockHead: TezosTypes.BlockMetadata,
        operations: object[]): Promise<string> {
        const payload = {
                branch: blockHead.hash,
                contents: operations
            };
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
        signedOpGroup: SignedOperationGroup): Promise<TezosTypes.AlphaOperationsWithMetadata[]> {
        const payload = [{
            protocol: blockHead.protocol,
            branch: blockHead.hash,
            contents: operations,
            signature: signedOpGroup.signature
        }];
        return TezosNode.applyOperation(network, payload)
    }

    /**
     * Ensures the results of operation application do not contain errors. Throws as needed if there are errors.
     * @param appliedOp Results of operation application.
     */
    function checkAppliedOperationResults(appliedOp): void {
        const validAppliedKinds = new Set(['activate_account', 'reveal', 'transaction', 'origination', 'delegation']);
        const firstAppliedOp = appliedOp[0];    //All our op groups are singletons so we deliberately check the zeroth result.
        if(firstAppliedOp.kind != null && !validAppliedKinds.has(firstAppliedOp.kind))
            throw(new Error(`Could not apply operation because: ${firstAppliedOp.id}`));
        for (const op of firstAppliedOp.contents) {
            if (!validAppliedKinds.has(op.kind)) throw(new Error(`Could not apply operation because: ${op.id}`))
        }

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
        const payload = sodium.to_hex(signedOpGroup.bytes);
        return TezosNode.injectOperation(network, payload)
    }

    /**
     * Master function for creating and sending all supported types of operations.
     * @param {string} network  Which Tezos network to go against
     * @param {object[]} operations The operations to create and send
     * @param {KeyStore} keyStore   Key pair along with public key hash
     * @param {string} derivationPath BIP44 Derivation Path if signed with hardware, empty if signed with software
     * @returns {Promise<OperationResult>}  The ID of the created operation group
     */
    export async function sendOperation(
        network: string,
        operations: object[],
        keyStore: KeyStore,
        derivationPath): Promise<OperationResult> {
        const blockHead = await TezosNode.getBlockHead(network);
        const forgedOperationGroup = await forgeOperations(network, blockHead, operations);
        const signedOpGroup = await signOperationGroup(forgedOperationGroup, keyStore, derivationPath);
        const operationGroupHash = computeOperationHash(signedOpGroup);
        const appliedOp = await applyOperation(network, blockHead, operations, operationGroupHash, forgedOperationGroup, signedOpGroup);
        checkAppliedOperationResults(appliedOp);
        const injectedOperation = await injectOperation(network, signedOpGroup);
        return {
            results: appliedOp[0],
            operationGroupID: injectedOperation
        }
    }

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
    export async function appendRevealOperation (
        network: string,
        keyStore: KeyStore,
        account: TezosTypes.Account,
        operations: Operation[]
    ) {
        const isManagerKeyRevealed = await isManagerKeyRevealedForAccount(network, keyStore)
        var returnedOperations: Operation[] = operations;
        if (!isManagerKeyRevealed) {
            let avgfee = 0.0;
            operations.forEach(o => avgfee += Number(o.fee));
            avgfee = avgfee/operations.length;
            const fee = avgfee < 1100 ? 1100 : avgfee;

            const revealOp: Operation = {
                kind: "reveal",
                source: keyStore.publicKeyHash,
                fee: fee.toString(), // Protocol 003 minimum for reveal operation is 1100
                counter: (Number(account.counter) + 1).toString(),
                gas_limit: '10000',
                storage_limit: '0',
                public_key: keyStore.publicKey
            };
            var operation = operations[0]
            operation.counter = (Number(account.counter) + 2).toString()
            returnedOperations = [revealOp, operation]
        }
        return returnedOperations
    }

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
    export async function sendTransactionOperation(
        network: string,
        keyStore: KeyStore,
        to: String,
        amount: number,
        fee: number,
        derivationPath: string
    ) {
        const blockHead = await TezosNode.getBlockHead(network);
        const sourceAccount = await TezosNode.getAccountForBlock(network, blockHead.hash, keyStore.publicKeyHash);
        const targetAccount = await TezosNode.getAccountForBlock(network, blockHead.hash, to.toString());

        const isImplicitTarget = to.toLowerCase().startsWith("tz");
        const isEmptyImplicitTarget = isImplicitTarget && targetAccount.balance == 0;

        const transaction: Operation = {
            destination: to,
            amount: amount.toString(),
            storage_limit: ((!isImplicitTarget || !isEmptyImplicitTarget) ? "0" : "277"),
            gas_limit: "10100",
            counter: (Number(sourceAccount.counter) + 1).toString(),
            fee: fee.toString(),
            source: keyStore.publicKeyHash,
            kind: "transaction"
        };

        const operations = await appendRevealOperation(network, keyStore, sourceAccount, [transaction])
        return sendOperation(network, operations, keyStore, derivationPath)
    }

    /**
     * Creates and sends a delegation operation.
     * @param {string} network  Which Tezos network to go against
     * @param {KeyStore} keyStore   Key pair along with public key hash
     * @param {String} delegate Account ID to delegate to
     * @param {number} fee  Operation fee
     * @param {string} derivationPath BIP44 Derivation Path if signed with hardware, empty if signed with software
     * @returns {Promise<OperationResult>}  Result of the operation
     */
    export async function sendDelegationOperation(
        network: string,
        keyStore: KeyStore,
        delegate: String,
        fee: number,
        derivationPath: string
    ) {
        const blockHead = await TezosNode.getBlockHead(network);
        const account = await TezosNode.getAccountForBlock(network, blockHead.hash, keyStore.publicKeyHash);
        const delegation: Operation = {
            kind: "delegation",
            source: keyStore.publicKeyHash,
            fee: fee.toString(),
            counter: (Number(account.counter) + 1).toString(),
            storage_limit: '0',
            gas_limit: '10000',
            delegate: delegate
        }
        const operations = await appendRevealOperation(network, keyStore, account, [delegation])
        return sendOperation(network, operations, keyStore, derivationPath)
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
     * @param {string} derivationPath BIP44 Derivation Path if signed with hardware, empty if signed with software
     * @returns {Promise<OperationResult>}  Result of the operation
     */
    export async function sendOriginationOperation(
        network: string,
        keyStore: KeyStore,
        amount: number,
        delegate: string,
        spendable: boolean,
        delegatable: boolean,
        fee: number,
        derivationPath: string
    ) {
        const blockHead = await TezosNode.getBlockHead(network);
        const account = await TezosNode.getAccountForBlock(network, blockHead.hash, keyStore.publicKeyHash);
        const origination: Operation = {
            kind: "origination",
            source: keyStore.publicKeyHash,
            fee: fee.toString(),
            counter: (Number(account.counter) + 1).toString(),
            gas_limit: '10000',
            storage_limit: '277',
            //managerPubkey: keyStore.publicKeyHash, // mainnet, alphanet
            manager_pubkey: keyStore.publicKeyHash,  // zeronet
            balance: amount.toString(),
            spendable: spendable,
            delegatable: delegatable,
            delegate: delegate
        };
        const operations = await appendRevealOperation(network, keyStore, account, [origination])
        return sendOperation(network, operations, keyStore, derivationPath)
    }

    /**
     * Indicates whether a reveal operation has already been done for a given account.
     * @param {string} network  Which Tezos network to go against
     * @param {KeyStore} keyStore   Key pair along with public key hash
     * @returns {Promise<boolean>}  Result
     */
    export async function isManagerKeyRevealedForAccount(network: string, keyStore: KeyStore): Promise<boolean> {
        const blockHead = await TezosNode.getBlockHead(network);
        const managerKey = await TezosNode.getAccountManagerForBlock(network, blockHead.hash, keyStore.publicKeyHash);
        return managerKey.key != null
    }

    /**
     * Creates and sends a reveal operation.
     * @param {string} network  Which Tezos network to go against
     * @param {KeyStore} keyStore   Key pair along with public key hash
     * @param {number} fee  Fee to pay
     * @param {string} derivationPath BIP44 Derivation Path if signed with hardware, empty if signed with software
     * @returns {Promise<OperationResult>}  Result of the operation
     */
    export async function sendKeyRevealOperation(
        network: string,
        keyStore: KeyStore,
        fee: number,
        derivationPath: string) {
        const blockHead = await TezosNode.getBlockHead(network);
        const account = await TezosNode.getAccountForBlock(network, blockHead.hash, keyStore.publicKeyHash);
        const revealOp: Object = {
            kind: "reveal",
            source: keyStore.publicKeyHash,
            fee: '1100',
            counter: (Number(account.counter) + 1).toString(),
            gas_limit: '10000',
            storage_limit: '0',
            public_key: keyStore.publicKey
        };
        const operations = [revealOp];
        return sendOperation(network, operations, keyStore, derivationPath)
    }

    /**
     * Creates and sends an activation operation.
     * @param {string} network  Which Tezos network to go against
     * @param {KeyStore} keyStore   Key pair along with public key hash
     * @param {string} activationCode   Activation code provided by fundraiser process
     * @param {string} derivationPath BIP44 Derivation Path if signed with hardware, empty if signed with software
     * @returns {Promise<OperationResult>}  Result of the operation
     */
    export function sendIdentityActivationOperation(
        network: string,
        keyStore: KeyStore,
        activationCode: string,
        derivationPath: string) {
        const activation = {
            kind:   "activate_account",
            pkh:    keyStore.publicKeyHash,
            secret: activationCode
        };
        const operations = [activation];
        return sendOperation(network, operations, keyStore, derivationPath)
    }
}

import sodium = require('libsodium-wrappers');

import {KeyStore, StoreType} from "../../types/wallet/KeyStore";
import {TezosNode} from "./TezosNodeQuery";
import * as TezosTypes from "../../types/tezos/TezosChainTypes";
import { TezosMessageCodec } from "./TezosMessageCodec";
import {TezosMessageUtils} from './TezosMessageUtil';

import DeviceUtils from '../../utils/DeviceUtils';

let LedgerUtils = DeviceUtils.getLedgerUtils();

/**
 *  Functions for sending operations on the Tezos network.
 */
export namespace TezosOperations {
    /**
     * Signs a forged operation
     * @param {string} forgedOperation Forged operation group returned by the Tezos client (as a hex string)
     * @param {KeyStore} keyStore Key pair along with public key hash
     * @param {string} derivationPath BIP44 Derivation Path if signed with hardware, empty if signed with software
     * @returns {SignedOperationGroup} Bytes of the signed operation along with the actual signature
     */
    // TODO: move this function to wallet files
    export async function signOperationGroup(forgedOperation: string, keyStore: KeyStore, derivationPath: string): Promise<TezosTypes.SignedOperationGroup> {
        const watermark = '03';
        const watermarkedForgedOperationBytesHex = watermark + forgedOperation;

        let opSignature: Buffer;
        switch(keyStore.storeType) {
            case StoreType.Hardware:
                opSignature = await LedgerUtils.signTezosOperation(derivationPath, watermarkedForgedOperationBytesHex);
                break;
            default:
                const watermarkedForgedOperationBytes: Buffer = sodium.from_hex(watermarkedForgedOperationBytesHex);
                const hashedWatermarkedOpBytes: Buffer = sodium.crypto_generichash(32, watermarkedForgedOperationBytes);
                const privateKeyBytes: Buffer = TezosMessageUtils.writeKeyWithHint(keyStore.privateKey, "edsk");
                opSignature = sodium.crypto_sign_detached(hashedWatermarkedOpBytes, privateKeyBytes);
        }

        const hexSignature: string = TezosMessageUtils.readSignatureWithHint(opSignature, "edsig").toString();
        const signedOpBytes = Buffer.concat([Buffer.from(sodium.from_hex(forgedOperation)), Buffer.from(opSignature)]);
        return {
            bytes: signedOpBytes,
            signature: hexSignature.toString()
        };
    }

    /**
     * Computes a has of an operation group then encodes it with Base58-check. This value becomes the operation group id.
     * 
     * @param {SignedOperationGroup} signedOpGroup Signed operation group
     * @returns {string} Base58Check hash of signed operation
     */
    export function computeOperationHash(signedOpGroup: TezosTypes.SignedOperationGroup): string {
        const hash: Buffer = sodium.crypto_generichash(32, signedOpGroup.bytes);
        return TezosMessageUtils.readBufferWithHint(hash, "op");
    }

    /**
     * Forge an operation group using the Tezos RPC client.
     * 
     * @param {string} network Which Tezos network to go against
     * @param {BlockMetadata} blockHead The block head
     * @param {object[]} operations The operations being forged as part of this operation group
     * @returns {Promise<string>} Forged operation bytes (as a hex string)
     */
    export async function forgeOperations(network: string, blockHead: TezosTypes.BlockMetadata, operations: object[]): Promise<string> {
        const payload = { branch: blockHead.hash, contents: operations };
        const ops = await TezosNode.forgeOperation(network, payload);

        let optypes = Array.from(operations.map(o => o["kind"]));
        let validate: boolean = false;
        for (let t in optypes) {
            validate = ["reveal", "transaction", "delegation", "origination"].includes(t);
            if (validate) { break; }
        }

        if (validate) {
            let decoded = TezosMessageCodec.parseOperationGroup(ops);

            for (let i = 0; i < operations.length; i++) {
                const clientop = operations[i];
                const serverop = decoded[i];
                if (clientop["kind"] === "transaction") {
                    if (serverop.kind !== clientop["kind"] || serverop.fee !== clientop["fee"] || serverop.amount !== clientop["amount"] || serverop.destination !== clientop["destination"]) {
                        throw new Error("Forged transaction failed validation.");
                    }
                } else if (clientop["kind"] === "delegation") {
                    if (serverop.kind !== clientop["kind"] || serverop.fee !== clientop["fee"] || serverop.delegate !== clientop["delegate"]) {
                        throw new Error("Forged delegation failed validation.");
                    }
                } else if (clientop["kind"] === "origination") {
                    if (serverop.kind !== clientop["kind"] || serverop.fee !== clientop["fee"] || serverop.balance !== clientop["balance"] || serverop.spendable !== clientop["spendable"] || serverop.delegatable !== clientop["delegatable"] || serverop.delegate !== clientop["delegate"] || serverop.script !== undefined) {
                        throw new Error("Forged origination failed validation.");
                    }
                }
            }
        }

        return ops;
    }

    /**
     * Applies an operation using the Tezos RPC client.
     * 
     * @param {string} network  Which Tezos network to go against
     * @param {BlockMetadata} blockHead Block head
     * @param {object[]} operations The operations to create and send
     * @param {SignedOperationGroup} signedOpGroup Signed operation group
     * @returns {Promise<AppliedOperation>} Array of contract handles
     */
    export function applyOperation(
        network: string,
        blockHead: TezosTypes.BlockMetadata,
        operations: object[],
        signedOpGroup: TezosTypes.SignedOperationGroup): Promise<TezosTypes.AlphaOperationsWithMetadata[]> {
        const payload = [{
            protocol: blockHead.protocol,
            branch: blockHead.hash,
            contents: operations,
            signature: signedOpGroup.signature
        }];

        return TezosNode.applyOperation(network, payload);
    }

    /**
     * Ensures the results of operation application do not contain errors. Throws if there are errors.
     * 
     * @param appliedOp Results of operation application.
     */
    function checkAppliedOperationResults(appliedOp: TezosTypes.AlphaOperationsWithMetadata[]): void {
        const validAppliedKinds = new Set(['activate_account', 'reveal', 'transaction', 'origination', 'delegation']);
        const firstAppliedOp = appliedOp[0]; // All our op groups are singletons so we deliberately check the zeroth result.

        if (firstAppliedOp.kind != null && !validAppliedKinds.has(firstAppliedOp.kind)) {
            throw new Error(`Could not apply operation because: ${firstAppliedOp.id}`);
        }

        for (const op of firstAppliedOp.contents) {
            if (!validAppliedKinds.has(op.kind)) { throw new Error(`Could not apply operation because: ${op.metadata}`); }
        }
    }

    /**
     * Injects an opertion using the Tezos RPC client.
     * 
     * @param {string} network Which Tezos network to go against
     * @param {SignedOperationGroup} signedOpGroup Signed operation group
     * @returns {Promise<InjectedOperation>} ID of injected operation
     */
    export function injectOperation(network: string, signedOpGroup: TezosTypes.SignedOperationGroup): Promise<string> {
        const payload = sodium.to_hex(signedOpGroup.bytes);
        return TezosNode.injectOperation(network, payload);
    }

    /**
     * Master function for creating and sending all supported types of operations.
     * @param {string} network  Which Tezos network to go against
     * @param {object[]} operations The operations to create and send
     * @param {KeyStore} keyStore Key pair along with public key hash
     * @param {string} derivationPath BIP44 Derivation Path if signed with hardware, empty if signed with software
     * @returns {Promise<OperationResult>}  The ID of the created operation group
     */
    export async function sendOperation(
        network: string,
        operations: object[],
        keyStore: KeyStore,
        derivationPath): Promise<TezosTypes.OperationResult> {
        const blockHead = await TezosNode.getBlockHead(network);
        const forgedOperationGroup = await forgeOperations(network, blockHead, operations);
        const signedOpGroup = await signOperationGroup(forgedOperationGroup, keyStore, derivationPath);
        const appliedOp = await applyOperation(network, blockHead, operations, signedOpGroup);
        checkAppliedOperationResults(appliedOp);
        const injectedOperation = await injectOperation(network, signedOpGroup);

        return {
            results: appliedOp[0],
            operationGroupID: injectedOperation
        };
    }

    /**
     * Helper function for sending Delegations, Transactions, and Originations.
     * Checks if manager's public key has been revealed for operation. If yes,
     * do nothing, else, bundle a reveal operation before the input operation.
     * 
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
        operations: TezosTypes.Operation[]
    ) {
        const isManagerKeyRevealed = await isManagerKeyRevealedForAccount(network, keyStore)
        let returnedOperations: TezosTypes.Operation[] = operations;
        if (!isManagerKeyRevealed) {
            const revealOp: TezosTypes.Operation = {
                kind: "reveal",
                source: keyStore.publicKeyHash,
                fee: '0', // Reveal Fee will be covered by the appended operation
                counter: (Number(account.counter) + 1).toString(),
                gas_limit: '10000',
                storage_limit: '0',
                public_key: keyStore.publicKey
            };
            let operation = operations[0];
            operation.counter = (Number(account.counter) + 2).toString();
            returnedOperations = [revealOp, operation];
        }

        return returnedOperations;
    }

    /**
     * Creates and sends a transaction operation.
     * @param {string} network Which Tezos network to go against
     * @param {KeyStore} keyStore Key pair along with public key hash
     * @param {String} to Destination public key hash
     * @param {number} amount Amount to send
     * @param {number} fee Fee to use
     * @param {string} derivationPath BIP44 Derivation Path if signed with hardware, empty if signed with software
     * @returns {Promise<OperationResult>} Result of the operation
     */
    export async function sendTransactionOperation(
        network: string,
        keyStore: KeyStore,
        to: string,
        amount: number,
        fee: number,
        derivationPath: string
    ) {
        const blockHead = await TezosNode.getBlockHead(network);
        const sourceAccount = await TezosNode.getAccountForBlock(network, blockHead.hash, keyStore.publicKeyHash);

        const transaction: TezosTypes.Operation = {
            destination: to,
            amount: amount.toString(),
            storage_limit: "300",
            gas_limit: "10300",
            counter: (Number(sourceAccount.counter) + 1).toString(),
            fee: fee.toString(),
            source: keyStore.publicKeyHash,
            kind: "transaction"
        };

        const operations = await appendRevealOperation(network, keyStore, sourceAccount, [transaction])

        return sendOperation(network, operations, keyStore, derivationPath);
    }

    /**
     * Creates and sends a delegation operation.
     * @param {string} network Which Tezos network to go against
     * @param {KeyStore} keyStore Key pair along with public key hash
     * @param {String} delegate Account ID to delegate to
     * @param {number} fee Operation fee
     * @param {string} derivationPath BIP44 Derivation Path if signed with hardware, empty if signed with software
     * @returns {Promise<OperationResult>} Result of the operation
     */
    export async function sendDelegationOperation(
        network: string,
        keyStore: KeyStore,
        delegate: string,
        fee: number,
        derivationPath: string
    ) {
        const blockHead = await TezosNode.getBlockHead(network);
        const account = await TezosNode.getAccountForBlock(network, blockHead.hash, keyStore.publicKeyHash);
        const delegation: TezosTypes.Operation = {
            kind: "delegation",
            source: keyStore.publicKeyHash,
            fee: fee.toString(),
            counter: (Number(account.counter) + 1).toString(),
            storage_limit: '0',
            gas_limit: '10000',
            delegate: delegate
        }
        const operations = await appendRevealOperation(network, keyStore, account, [delegation])

        return sendOperation(network, operations, keyStore, derivationPath);
    }

    /**
     * Sends an account origination operation.
     * 
     * @param {string} network Which Tezos network to go against
     * @param {KeyStore} keyStore Key pair along with public key hash
     * @param {number} amount Initial funding amount of new account
     * @param {string} delegate Account ID to delegate to, blank if none
     * @param {boolean} spendable Is account spendable?
     * @param {boolean} delegatable Is account delegatable?
     * @param {number} fee Operation fee
     * @param {string} derivationPath BIP44 Derivation Path if signed with hardware, empty if signed with software
     * @returns {Promise<OperationResult>} Result of the operation
     */
    export async function sendAccountOriginationOperation (
        network: string,
        keyStore: KeyStore,
        amount: number,
        delegate: string,
        spendable: boolean,
        delegatable: boolean,
        fee: number,
        derivationPath: string
    ) {
        return sendOriginationOperation(network, keyStore, amount, delegate, spendable, delegatable, fee, derivationPath, '10160', '277');
    }

    /**
     * Sends a contract origination operation.
     * 
     * @param {string} network Which Tezos network to go against
     * @param {KeyStore} keyStore Key pair along with public key hash
     * @param {number} amount Initial funding amount of new account
     * @param {string} delegate Account ID to delegate to, blank if none
     * @param {boolean} spendable Is account spendable?
     * @param {boolean} delegatable Is account delegatable?
     * @param {number} fee Operation fee
     * @param {string} derivationPath BIP44 Derivation Path if signed with hardware, empty if signed with software
     * @param {string} storage_limit Storage fee.
     * @param {string} gas_limit Gas limit.
     * @param {Array<object>} code Contract code.
     * @param {object} storage Initial storage value.
     */
    export async function sendContractOriginationOperation(
        network: string,
        keyStore: KeyStore,
        amount: number,
        delegate: string,
        spendable: boolean,
        delegatable: boolean,
        fee: number,
        derivationPath: string,
        storage_limit: string,
        gas_limit: string,
        code: Array<object>, // TODO: may have to change this type depending on how parser (from JS to michelson) works
        storage: object // TODO: may have to change this type depending on how parser (from JS to michelson) works
    ) {
        return sendOriginationOperation(network, keyStore, amount, delegate, spendable, delegatable, fee, derivationPath, storage_limit, gas_limit, code, storage);
    }

    /**
     * General purpose function for origination.
     * 
     * @param {string} network Which Tezos network to go against
     * @param {KeyStore} keyStore Key pair along with public key hash
     * @param {number} amount Initial funding amount of new account
     * @param {string} delegate Account ID to delegate to, blank if none
     * @param {boolean} spendable Is account spendable?
     * @param {boolean} delegatable Is account delegatable?
     * @param {number} fee Operation fee
     * @param {string} derivationPath BIP44 Derivation Path if signed with hardware, empty if signed with software
     * @param {string} storage_limit Storage fee.
     * @param {string} gas_limit Gas limit.
     * @param {Array<object>} code Contract code.
     * @param {object} storage Initial storage value.
     * 
     * @returns {Promise<OperationResult>} Result of the operation
     */
    async function sendOriginationOperation(
        network: string,
        keyStore: KeyStore,
        amount: number,
        delegate: string,
        spendable: boolean,
        delegatable: boolean,
        fee: number,
        derivationPath: string,
        storage_limit: string,
        gas_limit: string,
        code?: Array<object>, // TODO: may have to change this type depending on how parser (from JS to michelson) works
        storage?: object // TODO: may have to change this type depending on how parser (from JS to michelson) works
    ) {
        const blockHead = await TezosNode.getBlockHead(network);
        const account = await TezosNode.getAccountForBlock(network, blockHead.hash, keyStore.publicKeyHash);
        const origination: TezosTypes.Operation = {
            kind: "origination",
            source: keyStore.publicKeyHash,
            fee: fee.toString(),
            counter: (Number(account.counter) + 1).toString(),
            gas_limit: gas_limit,
            storage_limit: storage_limit,
            managerPubkey: keyStore.publicKeyHash, // mainnet, alphanet
            //manager_pubkey: keyStore.publicKeyHash, // zeronet
            balance: amount.toString(),
            spendable: spendable,
            delegatable: delegatable,
            delegate: delegate,
            script: code ? { code: code, storage: storage } : undefined
        };
        const operations = await appendRevealOperation(network, keyStore, account, [origination]);

        return sendOperation(network, operations, keyStore, derivationPath);
    }

    /**
     * Invokes a contract with desired parameters
     * 
     * @param network 
     * @param keyStore 
     * @param to 
     * @param amount 
     * @param fee 
     * @param derivationPath 
     * @param storage_limit 
     * @param gas_limit 
     * @param parameters 
     */
    export async function sendContractInvocationOperation(
        network: string,
        keyStore: KeyStore,
        to: string,
        amount: number,
        fee: number,
        derivationPath: string,
        storage_limit: string,
        gas_limit: string,
        parameters: object
    ) {
        const blockHead = await TezosNode.getBlockHead(network);
        const sourceAccount = await TezosNode.getAccountForBlock(network, blockHead.hash, keyStore.publicKeyHash);

        const transaction: TezosTypes.ContractInvocationOperation = {
            destination: to,
            amount: amount.toString(),
            storage_limit,
            gas_limit,
            counter: (Number(sourceAccount.counter) + 1).toString(),
            fee: fee.toString(),
            source: keyStore.publicKeyHash,
            kind: "transaction",
            parameters: parameters,
        };

        const operations = await appendRevealOperation(network, keyStore, sourceAccount, [transaction]);
        return sendOperation(network, operations, keyStore, derivationPath);
    }

    /**
     * Indicates whether an account is implicit and empty. If true, transaction will burn 0.257tz.
     * @param {string} network Which Tezos network to go against
     * @param {KeyStore} keyStore Key pair along with public key hash
     * @returns {Promise<boolean>} Result
     */
    export async function isImplicitAndEmpty(network: string, accountHash: string): Promise<boolean> {
        const blockHead = await TezosNode.getBlockHead(network);
        const account = await TezosNode.getAccountForBlock(network, blockHead.hash, accountHash);

        const isImplicit = accountHash.toLowerCase().startsWith("tz");
        const isEmpty = account.balance === 0;

        return (isImplicit && isEmpty)
    }

    /**
     * Indicates whether a reveal operation has already been done for a given account.
     * 
     * @param {string} network Which Tezos network to go against
     * @param {KeyStore} keyStore Key pair along with public key hash
     * @returns {Promise<boolean>} Result
     */
    export async function isManagerKeyRevealedForAccount(network: string, keyStore: KeyStore): Promise<boolean> {
        const blockHead = await TezosNode.getBlockHead(network);
        const managerKey = await TezosNode.getAccountManagerForBlock(network, blockHead.hash, keyStore.publicKeyHash);

        return managerKey.key != null;
    }

    /**
     * Creates and sends a reveal operation.
     * 
     * @param {string} network Which Tezos network to go against
     * @param {KeyStore} keyStore Key pair along with public key hash
     * @param {number} fee  Fee to pay
     * @param {string} derivationPath BIP44 Derivation Path if signed with hardware, empty if signed with software
     * @returns {Promise<OperationResult>} Result of the operation
     */
    export async function sendKeyRevealOperation(
        network: string,
        keyStore: KeyStore,
        fee: number,
        derivationPath: string) {
        const blockHead = await TezosNode.getBlockHead(network);
        const account = await TezosNode.getAccountForBlock(network, blockHead.hash, keyStore.publicKeyHash);
        const revealOp: TezosTypes.Operation = {
            kind: "reveal",
            source: keyStore.publicKeyHash,
            fee: '1300', //sendKeyRevealOperation is no longer used by Galleon. Set the correct minimum fee just for in case.
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
     * 
     * @param {string} network Which Tezos network to go against
     * @param {KeyStore} keyStore Key pair along with public key hash
     * @param {string} activationCode Activation code provided by fundraiser process
     * @param {string} derivationPath BIP44 Derivation Path if signed with hardware, empty if signed with software
     * @returns {Promise<OperationResult>} Result of the operation
     */
    export function sendIdentityActivationOperation(network: string, keyStore: KeyStore, activationCode: string, derivationPath: string) {
        const activation = { kind: "activate_account", pkh: keyStore.publicKeyHash, secret: activationCode };

        return sendOperation(network, [activation], keyStore, derivationPath)
    }
}

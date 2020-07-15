import * as blakejs from 'blakejs';

import { KeyStore, StoreType } from '../../types/wallet/KeyStore';
import * as TezosTypes from '../../types/tezos/TezosChainTypes';
import { TezosConstants } from '../../types/tezos/TezosConstants';
import * as TezosP2PMessageTypes from '../../types/tezos/TezosP2PMessageTypes';
import * as TezosRPCTypes from '../../types/tezos/TezosRPCResponseTypes';
import { TezosResponseError } from '../../types/tezos/TezosErrorTypes';
import { TezosNodeReader } from './TezosNodeReader';
import { TezosMessageCodec } from './TezosMessageCodec';
import { TezosMessageUtils } from './TezosMessageUtil';
import { TezosLanguageUtil } from './TezosLanguageUtil';
import { TezosOperationQueue } from './TezosOperationQueue';
import { CryptoUtils } from '../../utils/CryptoUtils';

import FetchSelector from '../../utils/FetchSelector'
const fetch = FetchSelector.getFetch();

import DeviceSelector from '../../utils/DeviceSelector';
let LedgerUtils = DeviceSelector.getLedgerUtils();

import LogSelector from '../../utils/LoggerSelector';
const log = LogSelector.log;

const { fetch } = FetchSelector;
const { log } = LogSelector;

const operationQueues = {};

/**
 *  Functions for sending operations on the Tezos network.
 */
export namespace TezosNodeWriter {
    /**
     * Send a POST request to a Tezos node.
     *
     * @param {string} server Which Tezos node to go against
     * @param {string} command RPC route to invoke
     * @param {object} payload Payload to submit
     * @returns {Promise<object>} JSON-encoded response
     */
    function performPostRequest(server: string, command: string, payload = {}): Promise<Response> {
        const url = `${server}/${command}`;
        const payloadStr = JSON.stringify(payload);

        log.debug(`TezosNodeWriter.performPostRequest sending ${payloadStr}\n->\n${url}`);

        return fetch(url, { method: 'post', body: payloadStr, headers: { 'content-type': 'application/json' } });
    }

    /**
     * Signs a forged operation
     * @param {string} forgedOperation Forged operation group returned by the Tezos client (as a hex string)
     * @param {KeyStore} keyStore Key pair along with public key hash
     * @param {string} derivationPath BIP44 Derivation Path if signed with hardware, empty if signed with software
     * @returns {SignedOperationGroup} Bytes of the signed operation along with the actual signature
     */
    // TODO: move this function to wallet files
    export async function signOperationGroup(forgedOperation: string, keyStore: KeyStore, derivationPath?: string): Promise<TezosTypes.SignedOperationGroup> {
        const watermarkedForgedOperationBytesHex = TezosConstants.OperationGroupWatermark + forgedOperation;

        let opSignature: Buffer;
        switch (keyStore.storeType) {
            case StoreType.Hardware:
                try {
                    opSignature = await LedgerUtils.signTezosOperation(derivationPath, watermarkedForgedOperationBytesHex);
                } catch (err) {
                    log.error(`TezosNodeWriter.signOperationGroup could not communicate with device: ${JSON.stringify(err)}`);
                    throw new Error("Failed to connect to the Ledger device");
                }
                break;
            default:
                const hashedWatermarkedOpBytes = CryptoUtils.simpleHash(Buffer.from(watermarkedForgedOperationBytesHex, 'hex'), 32);
                const privateKeyBytes = TezosMessageUtils.writeKeyWithHint(keyStore.privateKey, 'edsk');

                opSignature = await CryptoUtils.signDetached(hashedWatermarkedOpBytes, privateKeyBytes);
        }

        const hexSignature: string = TezosMessageUtils.readSignatureWithHint(opSignature, 'edsig').toString();
        const signedOpBytes = Buffer.concat([Buffer.from(forgedOperation, 'hex'), Buffer.from(opSignature)]);

        return { bytes: signedOpBytes, signature: hexSignature.toString() };
    }

    /**
     * Forge an operation group.
     *
     * @param {string} branch Hash of the current top block.
     * @param {TezosP2PMessageTypes.Operation[]} operations The operations being forged as part of this operation group.
     *
     * @returns {string} Forged operation bytes (as a hex string)
     */
    // TODO: move to an appropriate place
    export function forgeOperations(branch: string, operations: TezosP2PMessageTypes.Operation[]): string {
        log.debug('TezosNodeWriter.forgeOperations:');
        log.debug(JSON.stringify(operations));
        let encoded = TezosMessageUtils.writeBranch(branch);
        operations.forEach((m) => encoded += TezosMessageCodec.encodeOperation(m));

        return encoded;
    }

    /**
     * Forge an operation group using the Tezos RPC client. This is not a trustless path, but 'reveal', 'transaction', 'delegation', 'origination' operations are validated with a local parse. This method is available because the internal Michelson/Micheline converter is not yet 100% complete.
     * @deprecated
     *
     * @param {string} server Tezos node to connect to
     * @param {TezosRPCTypes.TezosBlock} blockHead The block head
     * @param {TezosP2PMessageTypes.Operation[]} operations The operations being forged as part of this operation group
     *
     * @returns {Promise<string>} Forged operation bytes (as a hex string)
     */
    export async function forgeOperationsRemotely(server: string, blockHead: TezosRPCTypes.TezosBlock, operations: TezosP2PMessageTypes.Operation[], chainid: string = 'main'): Promise<string> {
        log.debug('TezosNodeWriter.forgeOperations:');
        log.debug(JSON.stringify(operations));
        log.warn('forgeOperationsRemotely() is not intrinsically trustless');
        const response = await performPostRequest(server, `chains/${chainid}/blocks/head/helpers/forge/operations`, { branch: blockHead.hash, contents: operations });
        const forgedOperation = await response.text();
        const ops = forgedOperation.replace(/\n/g, '').replace(/['"]+/g, '');

        const optypes = Array.from(operations.map((o) => o.kind));
        let validate = false;
        for (let t in optypes) {
            validate = ['reveal', 'transaction', 'delegation', 'origination'].includes(t);
            if (validate) { break; }
        }

        if (validate) {
            const decoded = TezosMessageCodec.parseOperationGroup(ops);

            for (let i = 0; i < operations.length; i++) {
                const clientop = operations[i];
                const serverop = decoded[i];
                if (clientop.kind === 'transaction') { // Smart contract invocation parameters are not parsed due to limitations in the Michelson converter
                    const clientTransaction = <TezosP2PMessageTypes.Transaction> clientop;
                    if (serverop.kind !== clientTransaction.kind || serverop.fee !== clientTransaction.fee || serverop.amount !== clientTransaction.amount || serverop.destination !== clientTransaction.destination) {
                        throw new Error('Forged transaction failed validation.');
                    }
                } else if (clientop.kind === 'delegation') {
                    const clientDelegation = <TezosP2PMessageTypes.Delegation> clientop;
                    if (serverop.kind !== clientDelegation.kind || serverop.fee !== clientDelegation.fee || serverop.delegate !== clientDelegation.delegate) {
                        throw new Error('Forged delegation failed validation.');
                    }
                } else if (clientop.kind === 'origination') {
                    const clientorigination = <TezosP2PMessageTypes.Origination> clientop;
                    if (serverop.kind !== clientorigination.kind || serverop.fee !== clientorigination.fee || serverop.balance !== clientorigination.balance || serverop.spendable !== clientorigination.spendable || serverop.delegatable !== clientorigination.delegatable || serverop.delegate !== clientorigination.delegate || serverop.script !== undefined) {
                        throw new Error('Forged origination failed validation.');
                    }
                }
            }
        }

        return ops;
    }

    /**
     * Applies an operation using the Tezos RPC client.
     *
     * @param {string} server Tezos node to connect to
     * @param {string} branch Hash of the current top block
     * @param {string} protocol Protocol of the current top block
     * @param {Operation[]} operations The operations to create and send
     * @param {SignedOperationGroup} signedOpGroup Signed operation group
     * @returns {Promise<AppliedOperation>} Array of contract handles
     */
    export async function preapplyOperation(server: string, branch: string, protocol: string, operations: TezosP2PMessageTypes.Operation[], signedOpGroup: TezosTypes.SignedOperationGroup, chainid: string = 'main'): Promise<TezosTypes.AlphaOperationsWithMetadata[]> {
        const payload = [{
            protocol,
            branch,
            contents: operations,
            signature: signedOpGroup.signature
        }];

        const response = await performPostRequest(server, `chains/${chainid}/blocks/head/helpers/preapply/operations`, payload);
        const text = await response.text();

        let json;
        try {
            log.debug(`TezosNodeWriter.preapplyOperation received ${text}`);

            json = JSON.parse(text);
        } catch (err) {
            log.error('TezosNodeWriter.preapplyOperation failed to parse response');
            throw new Error(`Could not parse JSON from response of chains/${chainid}/blocks/head/helpers/preapply/operation: '${text}' for ${payload}`);
        }

        parseRPCError(text);

        return json as TezosTypes.AlphaOperationsWithMetadata[];
    }

    /**
     * Injects an operation using the Tezos RPC client.
     *
     * @param {string} server Tezos node to connect to
     * @param {SignedOperationGroup} signedOpGroup Signed operation group
     * @returns {Promise<InjectedOperation>} ID of injected operation
     */
    export async function injectOperation(server: string, signedOpGroup: TezosTypes.SignedOperationGroup, chainid: string = 'main'): Promise<string> {
        const response = await performPostRequest(server, `injection/operation?chain=${chainid}`, signedOpGroup.bytes.toString('hex'));
        const text = await response.text();

        parseRPCError(text);

        return text;
    }

    /**
     * Master function for creating and sending all supported types of operations.
     *
     * @param {string} server Tezos node to connect to
     * @param {Operation[]} operations The operations to create and send
     * @param {KeyStore} keyStore Key pair along with public key hash
     * @param {string} derivationPath BIP44 Derivation Path if signed with hardware, empty if signed with software
     * @returns {Promise<OperationResult>}  The ID of the created operation group
     */
    export async function sendOperation(server: string, operations: TezosP2PMessageTypes.Operation[], keyStore: KeyStore, derivationPath?: string): Promise<TezosTypes.OperationResult> {
        const blockHead = await TezosNodeReader.getBlockHead(server);
        const forgedOperationGroup = forgeOperations(blockHead.hash, operations);
        const signedOpGroup = await signOperationGroup(forgedOperationGroup, keyStore, derivationPath);
        const appliedOp = await preapplyOperation(server, blockHead.hash, blockHead.protocol, operations, signedOpGroup);

        const injectedOperation = await injectOperation(server, signedOpGroup);

        return { results: appliedOp[0], operationGroupID: injectedOperation };
    }

    /**
     * 
     * @param server 
     * @param operations 
     * @param keyStore 
     * @param derivationPath 
     * @param {number} batchDelay Number of seconds to wait before sending transactions off.
     */
    export function queueOperation(server: string, operations: TezosP2PMessageTypes.Operation[], keyStore: KeyStore, derivationPath: string = '', batchDelay: number = 25): void {
        const k = blakejs.blake2s(`${server}${keyStore.publicKeyHash}${derivationPath}`, null, 16);

        if (!!!operationQueues[k]) {
            operationQueues[k] = TezosOperationQueue.createQueue(server, derivationPath, keyStore, batchDelay);
        }

        operationQueues[k].addOperations(...operations);
    }

    export function getQueueStatus(server: string, keyStore: KeyStore, derivationPath: string = '') {
        const k = blakejs.blake2s(`${server}${keyStore.publicKeyHash}${derivationPath}`, null, 16);

        if (operationQueues[k]) {
            return operationQueues[k].getStatus();
        }

        return -1;
    }

    /**
     * Helper function for sending Delegations, Transactions, and Originations. Checks if manager's public key has been revealed for operation. If yes, do nothing, else, bundle a reveal operation before the input operation.
     *
     * @param {string} server Tezos node to connect to
     * @param {KeyStore} keyStore Key pair along with public key hash
     * @param {string} accountHash Account address to reveal.
     * @param {number} accountOperationIndex
     * @param {StackableOperation[]} operations Delegation, Transaction, or Origination to possibly bundle with a reveal
     */
    export async function appendRevealOperation(server: string, keyStore: KeyStore, accountHash: string, accountOperationIndex: number, operations: TezosP2PMessageTypes.StackableOperation[]) {
        const isKeyRevealed = await TezosNodeReader.isManagerKeyRevealedForAccount(server, accountHash);
        const counter = accountOperationIndex + 1;

        if (!isKeyRevealed) {
            const revealOp: TezosP2PMessageTypes.Reveal = {
                kind: 'reveal',
                source: accountHash,
                fee: '0', // Reveal Fee will be covered by the appended operation
                counter: counter.toString(),
                gas_limit: '10600',
                storage_limit: '0',
                public_key: keyStore.publicKey
            };

            operations.forEach((operation, index) => {
                const c: number = accountOperationIndex + 2 + index;
                operation.counter = c.toString();
            });

            return [revealOp, ...operations];
        }

        return operations;
    }

    /**
     * Creates and sends a transaction operation.
     *
     * @param {string} server Tezos node to connect to
     * @param {KeyStore} keyStore Key pair along with public key hash
     * @param {String} to Destination public key hash
     * @param {number} amount Amount to send
     * @param {number} fee Fee to use
     * @param {string} derivationPath BIP44 Derivation Path if signed with hardware, empty if signed with software
     * @returns {Promise<OperationResult>} Result of the operation
     */
    export async function sendTransactionOperation(server: string, keyStore: KeyStore, to: string, amount: number, fee: number, derivationPath: string = '') {
        const counter = await TezosNodeReader.getCounterForAccount(server, keyStore.publicKeyHash) + 1;

        const transaction: TezosP2PMessageTypes.Transaction = {
            destination: to,
            amount: amount.toString(),
            storage_limit: `${TezosConstants.DefaultTransactionStorageLimit}`,
            gas_limit: `${TezosConstants.DefaultTransactionGasLimit}`,
            counter: counter.toString(),
            fee: fee.toString(),
            source: keyStore.publicKeyHash,
            kind: 'transaction'
        };

        const operations = await appendRevealOperation(server, keyStore, keyStore.publicKeyHash, counter - 1, [transaction])

        return sendOperation(server, operations, keyStore, derivationPath);
    }

    /**
     * Creates and sends a delegation operation.
     *
     * @param {string} server Tezos node to connect to
     * @param {KeyStore} keyStore Key pair along with public key hash
     * @param {string} delegate Account address to delegate to, alternatively, '' or undefined if removing delegation
     * @param {number} fee Operation fee
     * @param {string} derivationPath BIP44 Derivation Path if signed with hardware, empty if signed with software
     * @returns {Promise<OperationResult>} Result of the operation
     */
    export async function sendDelegationOperation(server: string, keyStore: KeyStore, delegate: string | undefined, fee: number = TezosConstants.DefaultDelegationFee, derivationPath: string = '') { // TODO: constants
        const counter = await TezosNodeReader.getCounterForAccount(server, keyStore.publicKeyHash) + 1;

        const delegation: TezosP2PMessageTypes.Delegation = {
            kind: 'delegation',
            source: keyStore.publicKeyHash,
            fee: fee.toString(),
            counter: counter.toString(),
            storage_limit: TezosConstants.DefaultDelegationStorageLimit + '',
            gas_limit: TezosConstants.DefaultDelegationGasLimit + '',
            delegate: delegate
        }
        const operations = await appendRevealOperation(server, keyStore, keyStore.publicKeyHash, counter - 1, [delegation]);

        return sendOperation(server, operations, keyStore, derivationPath);
    }

    /**
     * Internally calls sendDelegationOperation with a blank delegate.
     *
     * @param {string} server Tezos node to connect to
     * @param {KeyStore} keyStore Key pair along with public key hash
     * @param {string} delegator Account address to delegate from
     * @param {number} fee Operation fee
     * @param {string} derivationPath BIP44 Derivation Path if signed with hardware, empty if signed with software
     * @returns {Promise<OperationResult>} Result of the operation
     */
    export async function sendUndelegationOperation(server: string, keyStore: KeyStore, fee: number = TezosConstants.DefaultDelegationFee, derivationPath: string = '') {
        return sendDelegationOperation(server, keyStore, undefined, fee, derivationPath);
    }

    /**
     * Sends a contract origination operation.
     *
     * @param {string} server Tezos node to connect to
     * @param {KeyStore} keyStore Key pair along with public key hash
     * @param {number} amount Initial funding amount of new account
     * @param {string|undefined} delegate Account ID to delegate to, blank if none
     * @param {number} fee Operation fee
     * @param {string|undefined} derivationPath BIP44 Derivation Path if signed with hardware, empty if signed with software
     * @param {number} storageLimit Storage fee
     * @param {number} gasLimit Gas limit
     * @param {string} code Contract code
     * @param {string} storage Initial storage value
     * @param {TezosParameterFormat} codeFormat Code format
     */
    export async function sendContractOriginationOperation(
        server: string,
        keyStore: KeyStore,
        amount: number,
        delegate: string | undefined,
        fee: number,
        derivationPath: string | undefined,
        storageLimit: number,
        gasLimit: number,
        code: string,
        storage: string,
        codeFormat: TezosTypes.TezosParameterFormat = TezosTypes.TezosParameterFormat.Micheline
    ) {
        const counter = await TezosNodeReader.getCounterForAccount(server, keyStore.publicKeyHash) + 1;
        const operation = constructContractOriginationOperation(
            keyStore,
            amount,
            delegate,
            fee,
            storageLimit,
            gasLimit,
            code,
            storage,
            codeFormat,
            counter
        );

        const operations = await appendRevealOperation(server, keyStore, keyStore.publicKeyHash, counter - 1, [operation]);
        return sendOperation(server, operations, keyStore, derivationPath);
    }

    /**
     * Construct a contract origination operation.
     *
     * @param {KeyStore} keyStore Key pair along with public key hash
     * @param {number} amount Initial funding amount of new account
     * @param {string|undefined} delegate Account ID to delegate to, blank if none
     * @param {number} fee Operation fee
     * @param {number} storageLimit Storage fee
     * @param {number} gasLimit Gas limit
     * @param {string} code Contract code
     * @param {string} storage Initial storage value
     * @param {TezosParameterFormat} codeFormat Code format
     */
    export function constructContractOriginationOperation(
        keyStore: KeyStore,
        amount: number,
        delegate: string | undefined,
        fee: number,
        storageLimit: number,
        gasLimit: number,
        code: string,
        storage: string,
        codeFormat: TezosTypes.TezosParameterFormat,
        counter: number
    ): TezosP2PMessageTypes.Origination {
        let parsedCode: any;
        let parsedStorage: any;

        if (codeFormat === TezosTypes.TezosParameterFormat.Michelson) {
            parsedCode = JSON.parse(TezosLanguageUtil.translateMichelsonToMicheline(code));
            log.debug(`TezosNodeWriter.sendOriginationOperation code translation:\n${code}\n->\n${JSON.stringify(parsedCode)}`);

            parsedStorage = JSON.parse(TezosLanguageUtil.translateMichelsonToMicheline(storage));
            log.debug(`TezosNodeWriter.sendOriginationOperation storage translation:\n${storage}\n->\n${JSON.stringify(parsedStorage)}`);
        } else if (codeFormat === TezosTypes.TezosParameterFormat.Micheline) {
            parsedCode = JSON.parse(code);
            parsedStorage = JSON.parse(storage); // TODO: handle empty storage
        }

        return {
            kind: 'origination',
            source: keyStore.publicKeyHash,
            fee: fee.toString(),
            counter: counter.toString(),
            gas_limit: gasLimit.toString(),
            storage_limit: storageLimit.toString(),
            balance: amount.toString(),
            delegate,
            script: { code: parsedCode, storage: parsedStorage }
        };
    }

    /**
     * Invokes a contract with desired parameters
     *
     * @param {string} server Tezos node to connect to
     * @param {KeyStore} keyStore Key pair along with public key hash
     * @param {string} to Contract address
     * @param {number} amount Amount to transfer along with the invocation
     * @param {number} fee Operation fee
     * @param {string} derivationPath BIP44 Derivation Path if signed with hardware, empty if signed with software
     * @param {string} storage_limit Storage fee
     * @param {string} gas_limit Gas limit
     * @param {string} entrypoint Contract entry point
     * @param {string} parameters Contract arguments
     * @param {TezosParameterFormat} parameterFormat Contract argument format
     */
    export async function sendContractInvocationOperation(
        server: string,
        keyStore: KeyStore,
        contract: string,
        amount: number,
        fee: number,
        derivationPath: string | undefined,
        storageLimit: number,
        gasLimit: number,
        entrypoint: string | undefined,
        parameters: string | undefined,
        parameterFormat: TezosTypes.TezosParameterFormat = TezosTypes.TezosParameterFormat.Micheline
    ) {
        const counter = await TezosNodeReader.getCounterForAccount(server, keyStore.publicKeyHash) + 1;

        const transaction = constructContractInvocationOperation(keyStore.publicKeyHash, counter, contract, amount, fee, storageLimit, gasLimit, entrypoint, parameters, parameterFormat);
        const operations = await appendRevealOperation(server, keyStore, keyStore.publicKeyHash, counter - 1, [transaction]);
        return sendOperation(server, operations, keyStore, derivationPath);
    }

    /**
     * Creates a transaction object for contract invocation.
     *
     */
    export function constructContractInvocationOperation(
        publicKeyHash: string,
        counter: number,
        to: string,
        amount: number,
        fee: number,
        storageLimit: number,
        gasLimit: number,
        entrypoint: string | undefined,
        parameters: string | undefined,
        parameterFormat: TezosTypes.TezosParameterFormat = TezosTypes.TezosParameterFormat.Micheline
    ): TezosP2PMessageTypes.Transaction {
        const transaction: TezosP2PMessageTypes.Transaction = {
            destination: to,
            amount: amount.toString(),
            storage_limit: storageLimit.toString(),
            gas_limit: gasLimit.toString(),
            counter: counter.toString(),
            fee: fee.toString(),
            source: publicKeyHash,
            kind: 'transaction'
        };

        if (parameters !== undefined) {
            if (parameterFormat === TezosTypes.TezosParameterFormat.Michelson) {
                const michelineParams = TezosLanguageUtil.translateParameterMichelsonToMicheline(parameters);
                transaction.parameters = { entrypoint: entrypoint || 'default', value: JSON.parse(michelineParams) };
            } else if (parameterFormat === TezosTypes.TezosParameterFormat.Micheline) {
                transaction.parameters = { entrypoint: entrypoint || 'default', value: JSON.parse(parameters) };
            } else if (parameterFormat === TezosTypes.TezosParameterFormat.MichelsonLambda) {
                const michelineLambda = TezosLanguageUtil.translateMichelsonToMicheline(`code ${parameters}`);
                transaction.parameters = { entrypoint: entrypoint || 'default', value: JSON.parse(michelineLambda) };
            }
        } else if (entrypoint !== undefined) {
            transaction.parameters = { entrypoint, value: [] };
        }

        return transaction;
    }

    /**
     * Invokes a contract without parameters and a 0 amount.
     *
     * @param {string} server Tezos node to connect to
     * @param {KeyStore} keyStore Key pair along with public key hash
     * @param {string} to Contract address
     * @param {number} fee Operation fee
     * @param {string} derivationPath BIP44 Derivation Path if signed with hardware, empty if signed with software
     * @param {string} storage_limit Storage fee
     * @param {string} gas_limit Gas limit
     * @param {string} entrypoint Contract entry point, or `undefined`
     */
    export async function sendContractPing(server: string, keyStore: KeyStore, to: string, fee: number, derivationPath: string, storageLimit: number, gasLimit: number, entrypoint: string | undefined) {
        return sendContractInvocationOperation(server, keyStore, to, 0, fee, derivationPath, storageLimit, gasLimit, entrypoint, undefined);
    }

    /**
     * Creates and sends a reveal operation.
     *
     * @param {string} server Tezos node to connect to
     * @param {KeyStore} keyStore Key pair along with public key hash
     * @param {number} fee Fee to pay
     * @param {string} derivationPath BIP44 Derivation Path if signed with hardware, empty if signed with software
     * @returns {Promise<OperationResult>} Result of the operation
     */
    export async function sendKeyRevealOperation(server: string, keyStore: KeyStore, fee: number = TezosConstants.DefaultKeyRevealFee, derivationPath: string = '') {
        const counter = await TezosNodeReader.getCounterForAccount(server, keyStore.publicKeyHash) + 1;

        const revealOp: TezosP2PMessageTypes.Reveal = {
            kind: 'reveal',
            source: keyStore.publicKeyHash,
            fee: `${fee}`,
            counter: counter.toString(),
            gas_limit: '10000',
            storage_limit: '0',
            public_key: keyStore.publicKey
        };
        const operations = [revealOp];

        return sendOperation(server, operations, keyStore, derivationPath)
    }

    /**
     * Creates and sends a fundraiser account activation operation.
     *
     * @param {string} server Tezos node to connect to
     * @param {KeyStore} keyStore Key pair along with public key hash
     * @param {string} activationCode Activation code provided by fundraiser process
     * @returns {Promise<OperationResult>} Result of the operation
     */
    export function sendIdentityActivationOperation(server: string, keyStore: KeyStore, activationCode: string) {
        const activation = { kind: 'activate_account', pkh: keyStore.publicKeyHash, secret: activationCode };

        return sendOperation(server, [activation], keyStore, '');
    }

    /**
     * Operation dry-run to get consumed gas and storage numbers
     *
     * @param {string} server Tezos node to connect to
     * @param {string} chainid The chain ID to apply the operation on.
     * @param {KeyStore} keyStore Key pair along with public key hash
     * @param {string} contract Contract address
     * @param {number} amount Amount to transfer along with the invocation
     * @param {number} fee Operation fee
     * @param {string} derivationPath BIP44 Derivation Path if signed with hardware, empty if signed with software
     * @param {string} storage_limit Storage fee
     * @param {string} gas_limit Gas limit
     * @param {string|undefined} entrypoint Contract entry point
     * @param {string|undefined} parameters Contract arguments
     * @param {TezosParameterFormat} parameterFormat Contract argument format
     * @returns A two-element object gas and storage costs. Throws an error if one was encountered.
     */
    export async function testContractInvocationOperation(
        server: string,
        chainid: string,
        keyStore: KeyStore,
        contract: string,
        amount: number,
        fee: number,
        storageLimit: number,
        gasLimit: number,
        entrypoint: string | undefined,
        parameters: string | undefined,
        parameterFormat: TezosTypes.TezosParameterFormat = TezosTypes.TezosParameterFormat.Micheline
    ): Promise<{ gas: number, storageCost: number }> {
        const counter = await TezosNodeReader.getCounterForAccount(server, keyStore.publicKeyHash) + 1;
        const transaction = constructContractInvocationOperation(
            keyStore.publicKeyHash,
            counter,
            contract,
            amount,
            fee,
            storageLimit,
            gasLimit,
            entrypoint,
            parameters,
            parameterFormat
        );

        return estimateOperation(server, chainid, transaction);
    }

    /**
     * Origination dry-run to get consumed gas and storage numbers
     *
     * @param {string} server Tezos node to connect to
     * @param {string} chainid The chain ID to apply the operation on.
     * @param {KeyStore} keyStore Key pair along with public key hash
     * @param {number} amount Initial funding amount of new account
     * @param {string|undefined} delegate Account ID to delegate to, blank if none
     * @param {number} fee Operation fee
     * @param {number} storageLimit Storage fee
     * @param {number} gasLimit Gas limit
     * @param {string} code Contract code
     * @param {string} storage Initial storage value
     * @param {TezosParameterFormat} codeFormat Code format
     * @returns A two-element object gas and storage costs. Throws an error if one was encountered.
     */
    export async function testContractDeployOperation(
        server: string,
        chainid: string,
        keyStore: KeyStore,
        amount: number,
        delegate: string | undefined,
        fee: number,
        storageLimit: number,
        gasLimit: number,
        code: string,
        storage: string,
        codeFormat: TezosTypes.TezosParameterFormat = TezosTypes.TezosParameterFormat.Micheline
    ): Promise<{ gas: number, storageCost: number }> {
        const counter = await TezosNodeReader.getCounterForAccount(server, keyStore.publicKeyHash) + 1;
        const transaction = constructContractOriginationOperation(
            keyStore,
            amount,
            delegate,
            fee,
            storageLimit,
            gasLimit,
            code,
            storage,
            codeFormat,
            counter
        );

        const resources = await estimateOperation(server, chainid, transaction);

        // A fixed storage cost is applied to new contract originations which is not included in the estimation response.
        const fixedOriginationStorageCost = 257;
        return {
            gas: resources.gas,
            storageCost: resources.storageCost + fixedOriginationStorageCost
        };
    }

    /**
     * Operation dry-run to simulate a transaction
     *
     * @param {string} server Tezos node to connect to
     * @param {Operation[]} operations The operations to create and send
     * @param {string} derivationPath BIP44 Derivation Path if signed with hardware, empty if signed with software
     * @param {string} chainid
     * @returns {object} Result of the operation. Throws an error if one was encountered.
     */
    export async function dryRunOperation(
      server: string,
      chainid: string,
      operation: TezosP2PMessageTypes.Operation[]
    ): Promise<any> {
        const fake_signature = 'edsigu6xFLH2NpJ1VcYshpjW99Yc1TAL1m2XBqJyXrxcZQgBMo8sszw2zm626yjpA3pWMhjpsahLrWdmvX9cqhd4ZEUchuBuFYy';
        const fake_chainid = 'NetXdQprcVkpaWU';
        const fake_branch = 'BL94i2ShahPx3BoNs6tJdXDdGeoJ9ukwujUA2P8WJwULYNdimmq';

        const response = await performPostRequest(server, `chains/${chainid}/blocks/head/helpers/scripts/run_operation`, { chain_id: fake_chainid, operation: { branch: fake_branch, contents: operation, signature: fake_signature } });
        const responseText = await response.text();

        parseRPCError(responseText);

        return JSON.parse(responseText);
    }


    /**
     * Dry run the given operation and return consumed resources.
     *
     * Note: Estimating an operation on an unrevealed account is not supported and will fail.
     *
     * TODO: Add support for estimating multiple operations so that reveals can be processed.
     *
     * @param {string} server Tezos node to connect to
     * @param {string} chainid The chain ID to apply the operation on.
     * @param {TezosP2PMessageTypes.Operation} operation The operation to estimate.
     * @returns A two-element object gas and storage costs. Throws an error if one was encountered.
     */
    export async function estimateOperation(
        server: string,
        chainid: string,
        operation: TezosP2PMessageTypes.Operation
    ): Promise<{ gas: number, storageCost: number }> {
        const responseJSON = await dryRunOperation(server, chainid, [operation]);

        let gas = 0;
        let storageCost = 0;
        for (const c of responseJSON.contents) {
            // Process main operation.
            try {
                gas += parseInt(c.metadata.operation_result.consumed_gas) || 0;
                storageCost += parseInt(c.metadata.operation_result.paid_storage_size_diff) || 0;
            } catch { }

            // Process internal operations if they are present.
            const internalOperations = c.metadata.internal_operation_results;
            if (internalOperations === undefined) {
                continue;
            }
            for (const internalOperation of internalOperations) {
                const { result } = internalOperation;
                gas += parseInt(result.consumed_gas) || 0;
                storageCost += parseInt(result.paid_storage_size_diff) || 0;
            }
        }

        return { gas, storageCost };
    }

    /**
     * This function checks if the server response contains an error. There are multiple formats for errors coming
     * back from the server, this method attempts to normalized them for downstream parsing.
     *
     * @param {string} response Text response from a Tezos RPC services
     * @returns Error text or `undefined`
     */
    function parseRPCError(response: string) {
        let errors = '';

        try {
            const json = JSON.parse(response);
            const arr = Array.isArray(json) ? json : [json];

            if ('kind' in arr[0]) {
                // TODO: show counter errors better: e.msg "already used for contract"
                errors = arr.map((e) => `(${e.kind}: ${e.id})`).join('');
            } else if (arr.length === 1 && arr[0].contents.length === 1 && arr[0].contents[0].kind === 'activate_account') {
                // in CARTHAGE and prior protocols activation failures are caught in the first branch
            } else {
                errors = arr.map((r) => r.contents)
                    .map((o) => o.map((c) => c.metadata.operation_result)
                        .filter((r) => r.status !== 'applied')
                        .map((r) => `${r.status}: ${r.errors.map((e) => `(${e.kind}: ${e.id})`).join(', ')}\n`))
                    .join('');
            }
        } catch (err) {
            if (response.startsWith('Failed to parse the request body: ')) {
                errors = response.slice(34);
            } else {
                const hash = response.replace(/\"/g, '').replace(/\n/, '');
                if (hash.length === 51 && hash.charAt(0) === 'o') {
                    // TODO: confirm base58check operation hash
                } else {
                    log.error(`failed to parse errors: '${err}' from '${response}'\n, PLEASE report this to the maintainers`);
                }
            }
        }

        if (errors.length > 0) { throw new Error(errors); } // TODO: use TezosResponseError
    }
}

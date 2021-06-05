import * as blakejs from 'blakejs';

import { KeyStore, Signer } from '../../types/ExternalInterfaces';
import * as TezosTypes from '../../types/tezos/TezosChainTypes';
import { TezosConstants } from '../../types/tezos/TezosConstants';
import { ServiceResponseError } from '../../types/ErrorTypes';
import * as TezosP2PMessageTypes from '../../types/tezos/TezosP2PMessageTypes';
import { TezosNodeReader } from './TezosNodeReader';
import { TezosMessageCodec } from './TezosMessageCodec';
import { TezosMessageUtils } from './TezosMessageUtil';
import { TezosLanguageUtil } from './TezosLanguageUtil';
import { TezosOperationQueue } from './TezosOperationQueue';

import FetchSelector from '../../utils/FetchSelector'
const fetch = FetchSelector.fetch;

import LogSelector from '../../utils/LoggerSelector';
const log = LogSelector.log;
const counterMatcher = new RegExp(/.*Counter [0-9]{1,} already used for contract.*/, 'gm');

let operationQueues = {}

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
     * Forge an operation group.
     *
     * @param {string} branch Hash of the current top block.
     * @param {TezosP2PMessageTypes.Operation[]} operations The operations being forged as part of this operation group.
     *
     * @returns {string} Forged operation bytes (as a hex string)
     */
    // TODO: move to an appropriate place
    export function forgeOperations(branch: string, operations: TezosP2PMessageTypes.Operation[]): string {
        log.debug(`TezosNodeWriter.forgeOperations: ${JSON.stringify(operations)}`);
        let encoded = TezosMessageUtils.writeBranch(branch);
        operations.forEach(m => encoded += TezosMessageCodec.encodeOperation(m));
        log.debug(`TezosNodeWriter.forgeOperations: ${encoded}`);
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
    export async function forgeOperationsRemotely(server: string, branch: string, operations: TezosP2PMessageTypes.Operation[], chainid: string = 'main'): Promise<string> {
        log.debug('TezosNodeWriter.forgeOperations:');
        log.debug(JSON.stringify(operations));
        log.warn('forgeOperationsRemotely() is not intrinsically trustless');
        const response = await performPostRequest(server, `chains/${chainid}/blocks/head/helpers/forge/operations`, { branch: branch, contents: operations });
        const forgedOperation = await response.text();
        const ops = forgedOperation.replace(/\n/g, '').replace(/['"]+/g, '');

        let optypes = Array.from(operations.map(o => o["kind"]));
        let validate = false;
        for (let t of optypes) {
            validate = ['reveal', 'transaction', 'delegation', 'origination'].includes(t);
            if (validate) { break; }
        }

        if (validate) {
            const decoded = TezosMessageCodec.parseOperationGroup(ops);

            for (let i = 0; i < operations.length; i++) {
                const clientop = operations[i];
                const serverop = decoded[i];
                if (clientop['kind'] === 'transaction') { // Smart contract invocation parameters are not parsed due to limitations in the Michelson converter
                    if (serverop.kind !== clientop['kind'] || serverop.fee !== clientop['fee'] || serverop.amount !== clientop['amount'] || serverop.destination !== clientop['destination']) {
                        throw new Error('Forged transaction failed validation.');
                    }
                } else if (clientop['kind'] === 'delegation') {
                    if (serverop.kind !== clientop['kind'] || serverop.fee !== clientop['fee'] || serverop.delegate !== clientop['delegate']) {
                        throw new Error('Forged delegation failed validation.');
                    }
                } else if (clientop['kind'] === 'origination') {
                    if (serverop.kind !== clientop['kind'] || serverop.fee !== clientop['fee'] || serverop.balance !== clientop['balance'] || serverop.spendable !== clientop['spendable'] || serverop.delegatable !== clientop['delegatable'] || serverop.delegate !== clientop['delegate'] || serverop.script !== undefined) {
                        throw new Error('Forged origination failed validation.');
                    }
                }
            }
        }

        return ops;
    }

    /**
     * Pack a Micheline structure subject to the provided type. Returns a hex string from the server.
     * 
     * This method is not a trustless. It is available because the internal Micheline converter is not yet 100% complete.
     * 
     * @deprecated
    */
    export async function packDataRemotely(server: string, data: string, type: string, gas: number = TezosConstants.OperationGasCap, chainid: string = 'main'): Promise<string> {
        log.debug('TezosNodeWriter.packDataRemotely:');
        log.debug(JSON.stringify(data));
        log.warn('packDataRemotely() is not intrinsically trustless');

        const response = await performPostRequest(server, `chains/${chainid}/blocks/head/helpers/scripts/pack_data`, { data, type, gas: `${gas}`});
        const jsonResponse = await response.json();

        try {
            return jsonResponse.packed;
        } catch (e) {
            throw new Error(`Could not pack ${data} as ${type}; error ${e}`);
        }
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
            protocol: protocol,
            branch: branch,
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
            log.error(`TezosNodeWriter.preapplyOperation failed to parse response`);
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
     * @param {Signer} signer Cryptographic signature provider
     * @param {number} offset Age of the block to use as branch, set to 0 for head, default is 54 to force operation expiration with 10 blocks.
     * @returns {Promise<OperationResult>} The ID of the created operation group
     */
    export async function sendOperation(
        server: string,
        operations: TezosP2PMessageTypes.Operation[],
        signer: Signer,
        offset: number = TezosConstants.HeadBranchOffset): Promise<TezosTypes.OperationResult> {
        const blockHead = await TezosNodeReader.getBlockAtOffset(server, offset);
        const blockHash = blockHead.hash.slice(0, 51); // consider throwing an error instead

        const forgedOperationGroup = forgeOperations(blockHash, operations);

        const opSignature = await signer.signOperation(Buffer.from(TezosConstants.OperationGroupWatermark + forgedOperationGroup, 'hex'));

        const signedOpGroup = Buffer.concat([Buffer.from(forgedOperationGroup, 'hex'), opSignature]);
        const base58signature = TezosMessageUtils.readSignatureWithHint(opSignature, signer.getSignerCurve());
        const opPair = { bytes: signedOpGroup, signature: base58signature };
        const appliedOp = await preapplyOperation(server, blockHash, blockHead.protocol, operations, opPair);
        const injectedOperation = await injectOperation(server, opPair);

        return { results: appliedOp[0], operationGroupID: injectedOperation }; // TODO
    }

    /**
     * 
     * @param server 
     * @param operations 
     * @param keyStore 
     * @param {number} batchDelay Number of seconds to wait before sending transactions off.
     */
    export function queueOperation(server: string, operations: TezosP2PMessageTypes.Operation[], signer: Signer, keyStore: KeyStore, batchDelay: number = 25): void {
        const k = blakejs.blake2s(`${server}${keyStore.publicKeyHash}`, null, 16);

        if (!!!operationQueues[k]) {
            operationQueues[k] = TezosOperationQueue.createQueue(server, signer, keyStore, batchDelay);
        }

        operationQueues[k].addOperations(...operations);
    }

    export function getQueueStatus(server: string, keyStore: KeyStore) {
        const k = blakejs.blake2s(`${server}${keyStore.publicKeyHash}`, null, 16);

        if (operationQueues[k]) {
            return operationQueues[k].getStatus();
        }

        return -1;
    }

    /**
     * Helper function for sending Delegations, Transactions, and Originations. Checks if manager's public key has been revealed for operation. If yes, do nothing, else, bundle a reveal operation before the input operation.
     *
     * @param {string} server Tezos node to connect to
     * @param {string} publicKey Key to be revealed
     * @param {string} accountHash Account address to reveal.
     * @param {number} accountOperationIndex
     * @param {StackableOperation[]} operations Delegation, Transaction, or Origination to possibly bundle with a reveal
     */
    export async function appendRevealOperation(server: string, publicKey: string, accountHash: string, accountOperationIndex: number, operations: TezosP2PMessageTypes.StackableOperation[]) {
        const isKeyRevealed = await TezosNodeReader.isManagerKeyRevealedForAccount(server, accountHash);
        const counter = accountOperationIndex + 1;

        if (!isKeyRevealed) {
            const revealOp: TezosP2PMessageTypes.Reveal = {
                kind: 'reveal',
                source: accountHash,
                fee: TezosConstants.DefaultKeyRevealFee.toString(),
                counter: counter.toString(),
                gas_limit: TezosConstants.DefaultKeyRevealGasLimit.toString(),
                storage_limit: TezosConstants.DefaultKeyRevealStorageLimit.toString(),
                public_key: publicKey
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
     * @param {number} fee Transaction fee to spend
     * @param {number} offset Age of the block to use as branch, set to 0 for head, default is 54 to force operation expiration with 10 blocks.
     * @returns {Promise<OperationResult>} Result of the operation
     */
    export async function sendTransactionOperation(
        server: string,
        signer: Signer,
        keyStore: KeyStore,
        to: string,
        amount: number,
        fee: number = TezosConstants.DefaultSimpleTransactionFee,
        offset: number = TezosConstants.HeadBranchOffset,
        optimizeFee: boolean = false) {
        const counter = await TezosNodeReader.getCounterForAccount(server, keyStore.publicKeyHash) + 1;

        const transaction: TezosP2PMessageTypes.Transaction = {
            destination: to,
            amount: amount.toString(),
            storage_limit: TezosConstants.DefaultTransactionStorageLimit + '',
            gas_limit: TezosConstants.DefaultTransactionGasLimit + '',
            counter: counter.toString(),
            fee: fee.toString(),
            source: keyStore.publicKeyHash,
            kind: 'transaction'
        };

        const operations = await prepareOperation(server, keyStore, counter, transaction, optimizeFee);

        return sendOperation(server, operations, signer, offset);
    }

    /**
     * Creates and sends a delegation operation.
     * 
     * @param {string} server Tezos node to connect to
     * @param {KeyStore} keyStore Key pair along with public key hash
     * @param {string} delegate Account address to delegate to, alternatively, '' or undefined if removing delegation
     * @param {number} fee Operation fee
     * @param {number} offset Age of the block to use as branch, set to 0 for head, default is 54 to force operation expiration with 10 blocks.
     * @returns {Promise<OperationResult>} Result of the operation
     */
    export async function sendDelegationOperation(
        server: string,
        signer: Signer,
        keyStore: KeyStore,
        delegate: string | undefined,
        fee: number = TezosConstants.DefaultDelegationFee,
        offset: number = TezosConstants.HeadBranchOffset,
        optimizeFee: boolean = false) {
        const counter = await TezosNodeReader.getCounterForAccount(server, keyStore.publicKeyHash) + 1;

        const delegation: TezosP2PMessageTypes.Delegation = {
            kind: 'delegation',
            source: keyStore.publicKeyHash,
            fee: fee.toString(),
            counter: counter.toString(),
            storage_limit: TezosConstants.DefaultDelegationStorageLimit.toString(),
            gas_limit: TezosConstants.DefaultDelegationGasLimit.toString(),
            delegate: delegate
        };

        const operations = await prepareOperation(server, keyStore, counter, delegation, optimizeFee);

        return sendOperation(server, operations, signer, offset);
    }

    /**
     * Internally calls sendDelegationOperation with a blank delegate.
     * 
     * @param {string} server Tezos node to connect to
     * @param {KeyStore} keyStore Key pair along with public key hash
     * @param {string} delegator Account address to delegate from
     * @param {number} fee Operation fee
     * @param {number} offset Age of the block to use as branch, set to 0 for head, default is 54 to force operation expiration with 10 blocks.
     * @returns {Promise<OperationResult>} Result of the operation
     */
    export async function sendUndelegationOperation(
        server: string,
        signer: Signer,
        keyStore: KeyStore,
        fee: number = TezosConstants.DefaultDelegationFee,
        offset: number = TezosConstants.HeadBranchOffset,
        optimizeFee: boolean = false) {
        return sendDelegationOperation(server, signer, keyStore, undefined, fee, offset, optimizeFee);
    }

    /**
     * Sends a contract origination operation.
     *
     * @param {string} server Tezos node to connect to
     * @param {KeyStore} keyStore Key pair along with public key hash
     * @param {number} amount Initial funding amount of new account
     * @param {string|undefined} delegate Account ID to delegate to, blank if none
     * @param {number} fee Operation fee
     * @param {number} storageLimit Storage fee
     * @param {number} gasLimit Gas limit
     * @param {string} code Contract code
     * @param {string} storage Initial storage value
     * @param {TezosParameterFormat} codeFormat Code format
     * @param {number} offset Age of the block to use as branch, set to 0 for head, default is 54 to force operation expiration with 10 blocks.
     */
    export async function sendContractOriginationOperation(
        server: string,
        signer: Signer,
        keyStore: KeyStore,
        amount: number,
        delegate: string | undefined,
        fee: number,
        storageLimit: number,
        gasLimit: number,
        code: string,
        storage: string,
        codeFormat: TezosTypes.TezosParameterFormat = TezosTypes.TezosParameterFormat.Micheline,
        offset: number = TezosConstants.HeadBranchOffset,
        optimizeFee: boolean = false
    ) {
        const counter = await TezosNodeReader.getCounterForAccount(server, keyStore.publicKeyHash) + 1;
        const origination = constructContractOriginationOperation(
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

        const operations = await prepareOperation(server, keyStore, counter, origination, optimizeFee);

        return sendOperation(server, operations, signer, offset);
    }

    /**
     * Construct a contract origination operation. 
     * 
     * @param {KeyStore} keyStore Key pair along with public key hash
     * @param {number} amount Initial funding amount of new account
     * @param {string|undefined} delegate Account ID to delegate to, blank if none
     * @param {number} fee Operation fee
     * @param {number} storageLimit Storage burn cap
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
        let parsedCode: any = undefined;
        let parsedStorage: any = undefined;

        if (codeFormat === TezosTypes.TezosParameterFormat.Michelson) {
            parsedCode = JSON.parse(TezosLanguageUtil.translateMichelsonToMicheline(code));
            log.debug(`TezosNodeWriter.constructContractOriginationOperation code translation:\n${code}\n->\n${JSON.stringify(parsedCode)}`);

            parsedStorage = JSON.parse(TezosLanguageUtil.translateMichelsonToMicheline(storage));
            log.debug(`TezosNodeWriter.constructContractOriginationOperation storage translation:\n${storage}\n->\n${JSON.stringify(parsedStorage)}`);
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
            delegate: delegate,
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
     * @param {string} storage_limit Storage fee
     * @param {string} gas_limit Gas limit
     * @param {string} entrypoint Contract entry point
     * @param {string} parameters Contract arguments
     * @param {TezosParameterFormat} parameterFormat Contract argument format
     * @param {number} offset Age of the block to use as branch, set to 0 for head, default is 54 to force operation expiration with 10 blocks.
     */
    export async function sendContractInvocationOperation(
        server: string,
        signer: Signer,
        keyStore: KeyStore,
        contract: string,
        amount: number,
        fee: number,
        storageLimit: number,
        gasLimit: number,
        entrypoint: string | undefined,
        parameters: string | undefined,
        parameterFormat: TezosTypes.TezosParameterFormat = TezosTypes.TezosParameterFormat.Micheline,
        offset: number = TezosConstants.HeadBranchOffset,
        optimizeFee: boolean = false
    ) {
        const counter = await TezosNodeReader.getCounterForAccount(server, keyStore.publicKeyHash) + 1;

        const transaction = constructContractInvocationOperation(keyStore.publicKeyHash, counter, contract, amount, fee, storageLimit, gasLimit, entrypoint, parameters, parameterFormat);

        const operations = await prepareOperation(server, keyStore, counter, transaction, optimizeFee);

        return sendOperation(server, operations, signer, offset);
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
        let transaction: TezosP2PMessageTypes.Transaction = {
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
            transaction.parameters = { entrypoint: entrypoint, value: [] };
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
     * @param {string} storage_limit Storage fee
     * @param {string} gas_limit Gas limit
     * @param {string} entrypoint Contract entry point, or `undefined`
     */
    export async function sendContractPing(server: string, signer: Signer, keyStore: KeyStore, to: string, fee: number, storageLimit: number, gasLimit: number, entrypoint: string | undefined) {
        return sendContractInvocationOperation(server, signer, keyStore, to, 0, fee, storageLimit, gasLimit, entrypoint, undefined);
    }

    /**
     * Creates and sends a reveal operation.
     *
     * @param {string} server Tezos node to connect to
     * @param {KeyStore} keyStore Key pair along with public key hash
     * @param {number} fee Fee to pay
     * @param {number} offset Age of the block to use as branch, set to 0 for head, default is 54 to force operation expiration with 10 blocks.
     * @returns {Promise<OperationResult>} Result of the operation
     */
    export async function sendKeyRevealOperation(server: string, signer: Signer, keyStore: KeyStore, fee: number = TezosConstants.DefaultKeyRevealFee, offset: number = TezosConstants.HeadBranchOffset) {
        const counter = await TezosNodeReader.getCounterForAccount(server, keyStore.publicKeyHash) + 1;

        const revealOp: TezosP2PMessageTypes.Reveal = {
            kind: 'reveal',
            source: keyStore.publicKeyHash,
            fee: fee + '',
            counter: counter.toString(),
            gas_limit: '10000',
            storage_limit: '0',
            public_key: keyStore.publicKey
        };
        const operations = [revealOp];

        return sendOperation(server, operations, signer, offset);
    }

    /**
     * Creates and sends a fundraiser account activation operation.
     *
     * @param {string} server Tezos node to connect to
     * @param {KeyStore} keyStore Key pair along with public key hash
     * @param {string} activationCode Activation code provided by fundraiser process
     * @returns {Promise<OperationResult>} Result of the operation
     */
    export function sendIdentityActivationOperation(server: string, signer: Signer, keyStore: KeyStore, activationCode: string) {
        const activation = { kind: 'activate_account', pkh: keyStore.publicKeyHash, secret: activationCode };

        return sendOperation(server, [activation], signer);
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
    ): Promise<{ gas: number, storageCost: number, estimatedFee: number, estimatedStorageBurn: number  }> {
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
    ): Promise<{ gas: number, storageCost: number, estimatedFee: number, estimatedStorageBurn: number  }> {
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
        )

        return estimateOperation(server, chainid, transaction);
    }

    /**
     * Returns an operation group fee and storage burn estimates along with an array of gas and storage limits for the constituent operations.
     *
     * Inspired by OperationFeeEstimator.estimateAndApplyFees from @tacoinfra/harbinger-lib.
     * 
     * @see https://github.com/tacoinfra/harbinger-lib/blob/c27cdd4643574c245ddca62bf7013964ae684bd5/src/operation-fee-estimator.ts#L30
     *
     * @param {string} server Tezos node to connect to
     * @param {string} chainid The chain ID to apply the operation on. 
     * @param operations An array of operations to process.
     * @returns {[gas: number, storageCost: number], estimatedFee: number, estimatedStorageBurn: number}
     */
    export async function estimateOperationGroup(server: string, chainid: string, operations: Array<TezosP2PMessageTypes.StackableOperation>): Promise<any> {
        let operationResources: { gas: number, storageCost: number }[] = [];

        for (let i = 0; i < operations.length; i++) { // Estimate each operation.
            const operation = operations[i];

            // Estimate resources used in the set of prior transactions.
            // If there were no prior transactions, set resource usage to 0.
            let priorConsumedResources = { gas: 0, storageCost: 0 };
            if (i > 0) {
                const priorTransactions = operations.slice(0, i);
                priorConsumedResources = await estimateOperation(server, chainid, ...priorTransactions);
            }

            // Estimate resources for everything up to the current transaction. Newer transactions may depend on previous transactions, thus all transactions must be estimated.
            const currentTransactions = operations.slice(0, i + 1);
            const currentConsumedResources = await TezosNodeWriter.estimateOperation(server, chainid, ...currentTransactions);

            // Find the actual transaction cost by calculating the delta between the two transactions resource usages.
            const gasLimitDelta = currentConsumedResources.gas - priorConsumedResources.gas;
            const storageLimitDelta = currentConsumedResources.storageCost - priorConsumedResources.storageCost;

            operationResources.push(
                {
                    gas: gasLimitDelta + TezosConstants.GasLimitPadding,
                    storageCost: storageLimitDelta + TezosConstants.StorageLimitPadding
                }
            );
        }

        const staticFee = (operations.filter(o => o.kind === 'reveal').length === 1) ? 1270 : 0; // TODO: there's probably a better way to do this

        const validBranch = 'BMLxA4tQjiu1PT2x3dMiijgvMTQo8AVxkPBPpdtM8hCfiyiC1jz';
        const gasLimitTotal = operationResources.map(r => r.gas).reduce((a, c) => a + c, 0);
        const storageLimitTotal = operationResources.map(r => r.storageCost).reduce((a, c) => a + c, 0);
        const forgedOperationGroup = forgeOperations(validBranch, operations);
        const groupSize = forgedOperationGroup.length / 2 + 64; // operation group bytes + signature bytes
        let estimatedFee = staticFee + Math.ceil(gasLimitTotal / 10) + TezosConstants.BaseOperationFee + groupSize + TezosConstants.DefaultBakerVig;
        const estimatedStorageBurn = Math.ceil(storageLimitTotal * TezosConstants.StorageRate);

        // if the fee nat is smaller than the estimate, add a constant to account for possible operation size difference
        if (Number(operations[0].fee) < estimatedFee) { estimatedFee += 16; }

        log.debug('group estimate', operationResources, estimatedFee, estimatedStorageBurn);

        return { operationResources, estimatedFee, estimatedStorageBurn };
    }

    /**
     * Submits the provided operation list to run_operation RPC and extracts gas and storage costs. Also provide estimated fee and storage burn. This function works by calling dryRunOperation() and it may throw an error if the operation is malformed or invalid.
     * 
     * @param {string} server Tezos node to connect to
     * @param {string} chainid The chain ID to apply the operation on. 
     * @param {TezosP2PMessageTypes.Operation} operations A set of operations to submit.
     * @returns A four-element object containing
     * gas, storageCost, estimatedFee and estimatedStorageBurn. These are exact, unpadded numbers, in practice it may be worthwhile to pad gas and storage limits.
     */
    export async function estimateOperation(
        server: string,
        chainid: string,
        ...operations: TezosP2PMessageTypes.Operation[]
    ): Promise<{ gas: number, storageCost: number, estimatedFee: number, estimatedStorageBurn: number }> {
        const localOperations = [...operations].map(o => { return { ...o, gas_limit: TezosConstants.OperationGasCap.toString(), storage_limit: TezosConstants.OperationStorageCap.toString() } });

        const responseJSON = await dryRunOperation(server, chainid, ...localOperations);

        let gas = 0;
        let storageCost = 0;
        let staticFee = 0
        for (let c of responseJSON['contents']) {
            // Process main operation.
            try {
                gas += parseInt(c['metadata']['operation_result']['consumed_gas']) || 0;
                storageCost += parseInt(c['metadata']['operation_result']['paid_storage_size_diff']) || 0;

                if (c.kind === 'origination' || c['metadata']['operation_result']['allocated_destination_contract']) {
                    storageCost += TezosConstants.EmptyAccountStorageBurn;
                } else if (c.kind === 'reveal') {
                    staticFee += 1270;
                }
            } catch { }

            // Process internal operations if they are present.
            const internalOperations = c['metadata']['internal_operation_results']
            if (internalOperations === undefined) { continue; }

            for (const internalOperation of internalOperations) {
                const result = internalOperation['result'];
                gas += parseInt(result['consumed_gas']) || 0;
                storageCost += parseInt(result['paid_storage_size_diff']) || 0;
                if (internalOperation.kind === 'origination') {
                    storageCost += TezosConstants.EmptyAccountStorageBurn;
                }
            }
        }

        const validBranch = 'BMLxA4tQjiu1PT2x3dMiijgvMTQo8AVxkPBPpdtM8hCfiyiC1jz';
        const forgedOperationGroup = forgeOperations(validBranch, operations);
        const operationSize = forgedOperationGroup.length / 2 + 64; // operation bytes + signature bytes
        const estimatedFee = staticFee + Math.ceil(gas / 10) + TezosConstants.BaseOperationFee + operationSize + TezosConstants.DefaultBakerVig;
        const estimatedStorageBurn = Math.ceil(storageCost * TezosConstants.StorageRate);
        log.debug(`TezosNodeWriter.estimateOperation; gas: ${gas}, storage: ${storageCost}, fee estimate: ${estimatedFee}, burn estimate: ${estimatedStorageBurn}`);

        return { gas, storageCost, estimatedFee, estimatedStorageBurn };
    }

    /**
     * Dry run the given operation and return consumed resources. RPC response will also be parser for errors and if any are found, an exception will be thrown.
     *
     * Note: Estimating an operation on an unrevealed account is not supported and will fail. Remember to prepend
     * the Reveal operation if required.

     * @param {string} server Tezos node to connect to
     * @param {string} chainid The chain ID to apply the operation on.
     * @param {TezosP2PMessageTypes.Operation} operations A set of operations to update.
     * @returns {Promise<any>} JSON-encoded response
     */
    export async function dryRunOperation(server: string, chainid: string, ...operations: TezosP2PMessageTypes.Operation[]): Promise<any> {
        const fake_signature = 'edsigu6xFLH2NpJ1VcYshpjW99Yc1TAL1m2XBqJyXrxcZQgBMo8sszw2zm626yjpA3pWMhjpsahLrWdmvX9cqhd4ZEUchuBuFYy';
        const fake_chainid = 'NetXdQprcVkpaWU';
        const fake_branch = 'BL94i2ShahPx3BoNs6tJdXDdGeoJ9ukwujUA2P8WJwULYNdimmq';

        const response = await performPostRequest(server, `chains/${chainid}/blocks/head/helpers/scripts/run_operation`, { chain_id: fake_chainid, operation: { branch: fake_branch, contents: operations, signature: fake_signature } });
        const responseText = await response.text();

        parseRPCError(responseText);

        const responseJSON = JSON.parse(responseText);

        return responseJSON;
    }

    /**
     * Adds a Reveal operation if needed and optimizes fees if asked.
     * 
     * @param server 
     * @param keyStore 
     * @param counter 
     * @param operation 
     * @param optimizeFee 
     */
    async function prepareOperation(server: string, keyStore: KeyStore, counter: number, operation: any, optimizeFee: boolean = false) {
        const operationGroup = await appendRevealOperation(server, keyStore.publicKey, keyStore.publicKeyHash, counter - 1, [operation]);

        if (optimizeFee) {
            const estimate = await estimateOperationGroup(server, 'main', operationGroup);
            operationGroup[0].fee = estimate.estimatedFee.toString();
            for (let i = 0; i < operationGroup.length; i++) {
                operationGroup[i].gas_limit = estimate.operationResources[i].gas.toString();
                operationGroup[i].storage_limit = estimate.operationResources[i].storageCost.toString();
            }
        }

        return operationGroup;
    }

    export async function prepareOperationGroup(server: string, keyStore: KeyStore, counter: number, operations: TezosP2PMessageTypes.StackableOperation[], optimizeFee: boolean = false) {
        const operationGroup = await appendRevealOperation(server, keyStore.publicKey, keyStore.publicKeyHash, counter, operations);

        if (optimizeFee) {
            const estimate = await estimateOperationGroup(server, 'main', operationGroup);
            operationGroup[0].fee = estimate.estimatedFee.toString();
            for (let i = 0; i < operationGroup.length; i++) {
                operationGroup[i].gas_limit = estimate.operationResources[i].gas.toString();
                operationGroup[i].storage_limit = estimate.operationResources[i].storageCost.toString();
            }
        }

        return operationGroup;
    }

    /**
     * This function checks if the server response contains an error. There are multiple formats for errors coming
     * back from the server, this method attempts to normalized them for downstream parsing.
     * 
     * @param {string} response Text response from a Tezos RPC services
     * @returns Error text or `undefined`
     */
    export function parseRPCError(response: string) {
        let errors = '';

        try {
            const json = JSON.parse(response);
            const arr = Array.isArray(json) ? json : [json];

            if ('kind' in arr[0]) {
                errors = arr.map(e => {
                    if (e.msg) {
                        if (counterMatcher.test(e.msg)) {
                            return `(${e.kind}: ${e.id}, counter already used)`;
                        }

                        return `(${e.kind}: ${e.id}, ${e.msg})`;
                    }

                    return `(${e.kind}: ${e.id})`;
                }).join(', ');
            } else if (arr.length === 1 && arr[0].contents.length === 1 && arr[0].contents[0].kind === 'activate_account') {
                // in CARTHAGE and prior protocols activation failures are caught in the first branch
            } else {
                errors = arr.map(r => r.contents)
                    .map(o => 
                        o.map(c => c.metadata.operation_result)
                        .concat(o.flatMap(c => c.metadata.internal_operation_results).filter(c => !!c).map(c => c.result))
                        .map(r => parseRPCOperationResult(r))
                        .filter(i => i.length > 0)
                        .join(', '))
                    .join(', ');
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

        if (errors.length > 0) {
            log.debug(`errors found in response:\n${response}`);
            let e = new ServiceResponseError(200, '', '', '', response);
            e.message = errors;
            throw e;
        }
    }

    /**
     * Processes `operation_result` and `internal_operation_results` objects from the RPC responses into an error string.
     */
    function parseRPCOperationResult(result: any): string {
        if (result.status !== 'applied') { // backtracked, skipped, failed
            let error = result.status;
            if (result.errors && result.errors.length > 0) {
                try {
                    error += result.errors.map(e => `(${e.kind}: ${e.id})`).join(', ');
                } catch {
                    log.error(`failed to parse errors from '${result}'\n, PLEASE report this to the maintainers`);
                }
            }
            return error;
        }

        return ''; // applied
    }
}

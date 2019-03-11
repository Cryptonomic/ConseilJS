import {KeyStore, StoreType} from '../../types/wallet/KeyStore';
import * as TezosTypes from '../../types/tezos/TezosChainTypes';
import {TezosNodeReader} from './TezosNodeReader';
import {TezosMessageCodec} from './TezosMessageCodec';
import {TezosMessageUtils} from './TezosMessageUtil';
import {CryptoUtils} from '../../utils/CryptoUtils';

import FetchSelector from '../../utils/FetchSelector'
const fetch = FetchSelector.getFetch();

import DeviceSelector from '../../utils/DeviceSelector';
let LedgerUtils = DeviceSelector.getLedgerUtils();

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
    export async function signOperationGroup(forgedOperation: string, keyStore: KeyStore, derivationPath: string): Promise<TezosTypes.SignedOperationGroup> {
        const watermark = '03';
        const watermarkedForgedOperationBytesHex = watermark + forgedOperation;

        let opSignature: Buffer;
        switch(keyStore.storeType) {
            case StoreType.Hardware:
                opSignature = await LedgerUtils.signTezosOperation(derivationPath, watermarkedForgedOperationBytesHex);
                break;
            default:
                const hashedWatermarkedOpBytes = CryptoUtils.simpleHash(Buffer.from(watermarkedForgedOperationBytesHex, 'hex'), 32);
                const privateKeyBytes = TezosMessageUtils.writeKeyWithHint(keyStore.privateKey, 'edsk');

                opSignature = await CryptoUtils.signDetached(hashedWatermarkedOpBytes, privateKeyBytes);
        }

        const hexSignature: string = TezosMessageUtils.readSignatureWithHint(opSignature, "edsig").toString();
        const signedOpBytes = Buffer.concat([Buffer.from(forgedOperation, 'hex'), Buffer.from(opSignature)]);

        return { bytes: signedOpBytes, signature: hexSignature.toString()};
    }

    /**
     * Forge an operation group.
     *
     * @param {BlockMetadata} blockHead The block head
     * @param {object[]} operations The operations being forged as part of this operation group
     *
     * @returns {string} Forged operation bytes (as a hex string)
     */
    export function forgeOperations(blockHead: TezosTypes.BlockMetadata, operations: object[]): string {
        let encoded = TezosMessageUtils.writeBranch(blockHead.hash);
        operations.forEach(m => encoded += TezosMessageCodec.encodeOperation(m));

        const optypes = Array.from(operations.map(o => o["kind"]));

        let validate = false;
        for (let t of optypes) {
            validate = ["reveal", "transaction", "delegation", "origination"].includes(t);

            if (validate) { break; }
        }

        if (validate) {
            let decoded = TezosMessageCodec.parseOperationGroup(encoded);

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

        return encoded;
    }

    /**
     * Applies an operation using the Tezos RPC client.
     *
     * @param {string} server Tezos node to connect to
     * @param {BlockMetadata} blockHead Block head
     * @param {object[]} operations The operations to create and send
     * @param {SignedOperationGroup} signedOpGroup Signed operation group
     * @returns {Promise<AppliedOperation>} Array of contract handles
     */
    export async function applyOperation(server: string, blockHead: TezosTypes.BlockMetadata, operations: object[], signedOpGroup: TezosTypes.SignedOperationGroup): Promise<TezosTypes.AlphaOperationsWithMetadata[]> {
        const payload = [{
            protocol: blockHead.protocol,
            branch: blockHead.hash,
            contents: operations,
            signature: signedOpGroup.signature
        }];

        const response = await performPostRequest(server, 'chains/main/blocks/head/helpers/preapply/operations', payload);
        const json = await response.json();

        return json as TezosTypes.AlphaOperationsWithMetadata[];
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
     * Injects an operation using the Tezos RPC client.
     *
     * @param {string} server Tezos node to connect to
     * @param {SignedOperationGroup} signedOpGroup Signed operation group
     * @returns {Promise<InjectedOperation>} ID of injected operation
     */
    export async function injectOperation(server: string, signedOpGroup: TezosTypes.SignedOperationGroup): Promise<string> {
        const response = await performPostRequest(server, 'injection/operation?chain=main', signedOpGroup.bytes.toString('hex'));
        const injectedOperation = await response.text();

        return injectedOperation;
    }

    /**
     * Master function for creating and sending all supported types of operations.
     * 
     * @param {string} server Tezos node to connect to
     * @param {object[]} operations The operations to create and send
     * @param {KeyStore} keyStore Key pair along with public key hash
     * @param {string} derivationPath BIP44 Derivation Path if signed with hardware, empty if signed with software
     * @returns {Promise<OperationResult>}  The ID of the created operation group
     */
    export async function sendOperation(server: string, operations: object[], keyStore: KeyStore, derivationPath): Promise<TezosTypes.OperationResult> {
        const blockHead = await TezosNodeReader.getBlockHead(server);
        const forgedOperationGroup = forgeOperations(blockHead, operations);
        const signedOpGroup = await signOperationGroup(forgedOperationGroup, keyStore, derivationPath);
        const appliedOp = await applyOperation(server, blockHead, operations, signedOpGroup);
        checkAppliedOperationResults(appliedOp);
        const injectedOperation = await injectOperation(server, signedOpGroup);

        return { results: appliedOp[0], operationGroupID: injectedOperation };
    }

    /**
     * Helper function for sending Delegations, Transactions, and Originations. Checks if manager's public key has been revealed for operation. If yes, do nothing, else, bundle a reveal operation before the input operation.
     *
     * @param {string} server Tezos node to connect to
     * @param keyStore  Key pair along with public key hash
     * @param fee Fee to use
     * @param account Which account to use
     * @param operations Delegation, Transaction, or Origination to possibly bundle with a reveal
     */
    export async function appendRevealOperation (server: string, keyStore: KeyStore, account: TezosTypes.Account, operations: TezosTypes.Operation[]) {
        const isManagerKeyRevealed = await TezosNodeReader.isManagerKeyRevealedForAccount(server, keyStore)
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
     * 
     * @param {string} server Tezos node to connect to
     * @param {KeyStore} keyStore Key pair along with public key hash
     * @param {String} to Destination public key hash
     * @param {number} amount Amount to send
     * @param {number} fee Fee to use
     * @param {string} derivationPath BIP44 Derivation Path if signed with hardware, empty if signed with software
     * @returns {Promise<OperationResult>} Result of the operation
     */
    export async function sendTransactionOperation(
        server: string,
        keyStore: KeyStore,
        to: string,
        amount: number,
        fee: number,
        derivationPath: string
    ) {
        const blockHead = await TezosNodeReader.getBlockHead(server);
        const sourceAccount = await TezosNodeReader.getAccountForBlock(server, blockHead.hash, keyStore.publicKeyHash);

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

        const operations = await appendRevealOperation(server, keyStore, sourceAccount, [transaction])

        return sendOperation(server, operations, keyStore, derivationPath);
    }

    /**
     * Creates and sends a delegation operation.
     * 
     * @param {string} server Tezos node to connect to
     * @param {KeyStore} keyStore Key pair along with public key hash
     * @param {String} delegate Account ID to delegate to
     * @param {number} fee Operation fee
     * @param {string} derivationPath BIP44 Derivation Path if signed with hardware, empty if signed with software
     * @returns {Promise<OperationResult>} Result of the operation
     */
    export async function sendDelegationOperation(
        server: string,
        keyStore: KeyStore,
        delegate: string,
        fee: number,
        derivationPath: string
    ) {
        const blockHead = await TezosNodeReader.getBlockHead(server);
        const account = await TezosNodeReader.getAccountForBlock(server, blockHead.hash, keyStore.publicKeyHash);
        const delegation: TezosTypes.Operation = {
            kind: "delegation",
            source: keyStore.publicKeyHash,
            fee: fee.toString(),
            counter: (Number(account.counter) + 1).toString(),
            storage_limit: '0',
            gas_limit: '10000',
            delegate: delegate
        }
        const operations = await appendRevealOperation(server, keyStore, account, [delegation])

        return sendOperation(server, operations, keyStore, derivationPath);
    }

    /**
     * Sends an account origination operation.
     *
     * @param {string} server Tezos node to connect to
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
        server: string,
        keyStore: KeyStore,
        amount: number,
        delegate: string,
        spendable: boolean,
        delegatable: boolean,
        fee: number,
        derivationPath: string
    ) {
        return sendOriginationOperation(server, keyStore, amount, delegate, spendable, delegatable, fee, derivationPath, '277', '10160');
    }

    /**
     * Sends a contract origination operation.
     *
     * @param {string} server Tezos node to connect to
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
        server: string,
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
        return sendOriginationOperation(server, keyStore, amount, delegate, spendable, delegatable, fee, derivationPath, storage_limit, gas_limit, code, storage);
    }

    /**
     * General purpose function for origination.
     *
     * @param {string} server Tezos node to connect to
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
        server: string,
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
        const blockHead = await TezosNodeReader.getBlockHead(server);
        const account = await TezosNodeReader.getAccountForBlock(server, blockHead.hash, keyStore.publicKeyHash);
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
        const operations = await appendRevealOperation(server, keyStore, account, [origination]);

        return sendOperation(server, operations, keyStore, derivationPath);
    }

    /**
     * Invokes a contract with desired parameters
     *
     * @param server
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
        server: string,
        keyStore: KeyStore,
        to: string,
        amount: number,
        fee: number,
        derivationPath: string,
        storageLimit: number,
        gasLimit: number,
        parameters: object
    ) {
        const blockHead = await TezosNodeReader.getBlockHead(server);
        const sourceAccount = await TezosNodeReader.getAccountForBlock(server, blockHead.hash, keyStore.publicKeyHash);

        const transaction: TezosTypes.ContractInvocationOperation = {
            destination: to,
            amount: amount.toString(),
            storage_limit: storageLimit.toString(),
            gas_limit: gasLimit.toString(),
            counter: (Number(sourceAccount.counter) + 1).toString(),
            fee: fee.toString(),
            source: keyStore.publicKeyHash,
            kind: "transaction",
            parameters: parameters,
        };

        const operations = await appendRevealOperation(server, keyStore, sourceAccount, [transaction]);
        return sendOperation(server, operations, keyStore, derivationPath);
    }

    /**
     * Creates and sends a reveal operation.
     *
     * @param {string} server Tezos node to connect to
     * @param {KeyStore} keyStore Key pair along with public key hash
     * @param {number} fee  Fee to pay
     * @param {string} derivationPath BIP44 Derivation Path if signed with hardware, empty if signed with software
     * @returns {Promise<OperationResult>} Result of the operation
     */
    export async function sendKeyRevealOperation(
        server: string,
        keyStore: KeyStore,
        fee: number,
        derivationPath: string) {
        const blockHead = await TezosNodeReader.getBlockHead(server);
        const account = await TezosNodeReader.getAccountForBlock(server, blockHead.hash, keyStore.publicKeyHash);
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

        return sendOperation(server, operations, keyStore, derivationPath)
    }

    /**
     * Creates and sends an activation operation.
     *
     * @param {string} server Tezos node to connect to
     * @param {KeyStore} keyStore Key pair along with public key hash
     * @param {string} activationCode Activation code provided by fundraiser process
     * @param {string} derivationPath BIP44 Derivation Path if signed with hardware, empty if signed with software
     * @returns {Promise<OperationResult>} Result of the operation
     */
    export function sendIdentityActivationOperation(server: string, keyStore: KeyStore, activationCode: string, derivationPath: string) {
        const activation = { kind: "activate_account", pkh: keyStore.publicKeyHash, secret: activationCode };

        return sendOperation(server, [activation], keyStore, derivationPath)
    }
}

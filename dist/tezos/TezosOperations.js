"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sodium = require("libsodium-wrappers");
const CryptoUtils = __importStar(require("../utils/CryptoUtils"));
const KeyStore_1 = require("../types/KeyStore");
const TezosNodeQuery_1 = require("./TezosNodeQuery");
const TezosMessageCodec_1 = require("./TezosMessageCodec");
const DeviceUtils_1 = __importDefault(require("../utils/DeviceUtils"));
let LedgerUtils = DeviceUtils_1.default.getLedgerUtils();
var TezosOperations;
(function (TezosOperations) {
    /**
     * Signs a forged operation
     * @param {string} forgedOperation  Forged operation group returned by the Tezos client (as a hex string)
     * @param {KeyStore} keyStore   Key pair along with public key hash
     * @param {string} derivationPath BIP44 Derivation Path if signed with hardware, empty if signed with software
     * @returns {SignedOperationGroup}  Bytes of the signed operation along with the actual signature
     */
    function signOperationGroup(forgedOperation, keyStore, derivationPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const watermark = '03';
            const watermarkedForgedOperationBytesHex = watermark + forgedOperation;
            let opSignature = new Buffer(0);
            switch (keyStore.storeType) {
                case KeyStore_1.StoreType.Hardware:
                    opSignature = yield LedgerUtils.signTezosOperation(derivationPath, watermarkedForgedOperationBytesHex);
                    break;
                default:
                    const watermarkedForgedOperationBytes = sodium.from_hex(watermarkedForgedOperationBytesHex);
                    const hashedWatermarkedOpBytes = sodium.crypto_generichash(32, watermarkedForgedOperationBytes);
                    const privateKeyBytes = CryptoUtils.base58CheckDecode(keyStore.privateKey, "edsk");
                    opSignature = sodium.crypto_sign_detached(hashedWatermarkedOpBytes, privateKeyBytes);
            }
            const hexSignature = CryptoUtils.base58CheckEncode(opSignature, "edsig").toString();
            const signedOpBytes = Buffer.concat([Buffer.from(sodium.from_hex(forgedOperation)), Buffer.from(opSignature)]);
            return {
                bytes: signedOpBytes,
                signature: hexSignature.toString()
            };
        });
    }
    TezosOperations.signOperationGroup = signOperationGroup;
    /**
     * Computes the ID of an operation group using Base58Check.
     * @param {SignedOperationGroup} signedOpGroup  Signed operation group
     * @returns {string}    Base58Check hash of signed operation
     */
    function computeOperationHash(signedOpGroup) {
        const hash = sodium.crypto_generichash(32, signedOpGroup.bytes);
        return CryptoUtils.base58CheckEncode(hash, "op");
    }
    TezosOperations.computeOperationHash = computeOperationHash;
    /**
     * Forge an operation group using the Tezos RPC client.
     * @param {string} network Which Tezos network to go against
     * @param {BlockMetadata} blockHead The block head
     * @param {object[]} operations The operations being forged as part of this operation group
     * @returns {Promise<string>} Forged operation bytes (as a hex string)
     */
    function forgeOperations(network, blockHead, operations) {
        return __awaiter(this, void 0, void 0, function* () {
            const payload = { branch: blockHead.hash, contents: operations };
            const ops = yield TezosNodeQuery_1.TezosNode.forgeOperation(network, payload);
            let optypes = Array.from(operations.map(o => o["kind"]));
            let validate = false;
            for (let t in optypes) {
                validate = ["reveal", "transaction", "delegation", "origination"].includes(t);
                if (validate) {
                    break;
                }
            }
            if (validate) {
                let decoded = TezosMessageCodec_1.TezosMessageCodec.parseOperationGroup(ops);
                for (let i = 0; i < operations.length; i++) {
                    const clientop = operations[i];
                    const serverop = decoded[i];
                    if (clientop["kind"] === "transaction") {
                        if (serverop.kind !== clientop["kind"] || serverop.fee !== clientop["fee"] || serverop.amount !== clientop["amount"] || serverop.destination !== clientop["destination"]) {
                            throw new Error("Forged transaction failed validation.");
                        }
                    }
                    else if (clientop["kind"] === "delegation") {
                        if (serverop.kind !== clientop["kind"] || serverop.fee !== clientop["fee"] || serverop.delegate !== clientop["delegate"]) {
                            throw new Error("Forged delegation failed validation.");
                        }
                    }
                    else if (clientop["kind"] === "origination") {
                        if (serverop.kind !== clientop["kind"] || serverop.fee !== clientop["fee"] || serverop.balance !== clientop["balance"] || serverop.spendable !== clientop["spendable"] || serverop.delegatable !== clientop["delegatable"] || serverop.delegate !== clientop["delegate"] || serverop.script !== undefined) {
                            throw new Error("Forged origination failed validation.");
                        }
                    }
                }
            }
            return ops;
        });
    }
    TezosOperations.forgeOperations = forgeOperations;
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
    function applyOperation(network, blockHead, operations, operationGroupHash, forgedOperationGroup, signedOpGroup) {
        const payload = [{
                protocol: blockHead.protocol,
                branch: blockHead.hash,
                contents: operations,
                signature: signedOpGroup.signature
            }];
        return TezosNodeQuery_1.TezosNode.applyOperation(network, payload);
    }
    TezosOperations.applyOperation = applyOperation;
    /**
     * Ensures the results of operation application do not contain errors. Throws as needed if there are errors.
     * @param appliedOp Results of operation application.
     */
    function checkAppliedOperationResults(appliedOp) {
        const validAppliedKinds = new Set(['activate_account', 'reveal', 'transaction', 'origination', 'delegation']);
        const firstAppliedOp = appliedOp[0]; // All our op groups are singletons so we deliberately check the zeroth result.
        if (firstAppliedOp.kind != null && !validAppliedKinds.has(firstAppliedOp.kind)) {
            throw new Error(`Could not apply operation because: ${firstAppliedOp.id}`);
        }
        for (const op of firstAppliedOp.contents) {
            if (!validAppliedKinds.has(op.kind)) {
                throw new Error(`Could not apply operation because: ${op.metadata}`);
            }
        }
    }
    /**
     * Injects an opertion using the Tezos RPC client.
     * @param {string} network  Which Tezos network to go against
     * @param {SignedOperationGroup} signedOpGroup  Signed operation group
     * @returns {Promise<InjectedOperation>}    ID of injected operation
     */
    function injectOperation(network, signedOpGroup) {
        const payload = sodium.to_hex(signedOpGroup.bytes);
        return TezosNodeQuery_1.TezosNode.injectOperation(network, payload);
    }
    TezosOperations.injectOperation = injectOperation;
    /**
     * Master function for creating and sending all supported types of operations.
     * @param {string} network  Which Tezos network to go against
     * @param {object[]} operations The operations to create and send
     * @param {KeyStore} keyStore   Key pair along with public key hash
     * @param {string} derivationPath BIP44 Derivation Path if signed with hardware, empty if signed with software
     * @returns {Promise<OperationResult>}  The ID of the created operation group
     */
    function sendOperation(network, operations, keyStore, derivationPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const blockHead = yield TezosNodeQuery_1.TezosNode.getBlockHead(network);
            const forgedOperationGroup = yield forgeOperations(network, blockHead, operations);
            const signedOpGroup = yield signOperationGroup(forgedOperationGroup, keyStore, derivationPath);
            const operationGroupHash = computeOperationHash(signedOpGroup);
            const appliedOp = yield applyOperation(network, blockHead, operations, operationGroupHash, forgedOperationGroup, signedOpGroup);
            checkAppliedOperationResults(appliedOp);
            const injectedOperation = yield injectOperation(network, signedOpGroup);
            return {
                results: appliedOp[0],
                operationGroupID: injectedOperation
            };
        });
    }
    TezosOperations.sendOperation = sendOperation;
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
    function appendRevealOperation(network, keyStore, account, operations) {
        return __awaiter(this, void 0, void 0, function* () {
            const isManagerKeyRevealed = yield isManagerKeyRevealedForAccount(network, keyStore);
            let returnedOperations = operations;
            if (!isManagerKeyRevealed) {
                const revealOp = {
                    kind: "reveal",
                    source: keyStore.publicKeyHash,
                    fee: '0',
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
        });
    }
    TezosOperations.appendRevealOperation = appendRevealOperation;
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
    function sendTransactionOperation(network, keyStore, to, amount, fee, derivationPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const blockHead = yield TezosNodeQuery_1.TezosNode.getBlockHead(network);
            const sourceAccount = yield TezosNodeQuery_1.TezosNode.getAccountForBlock(network, blockHead.hash, keyStore.publicKeyHash);
            const targetAccount = yield TezosNodeQuery_1.TezosNode.getAccountForBlock(network, blockHead.hash, to.toString());
            const transaction = {
                destination: to,
                amount: amount.toString(),
                storage_limit: "300",
                gas_limit: "10300",
                counter: (Number(sourceAccount.counter) + 1).toString(),
                fee: fee.toString(),
                source: keyStore.publicKeyHash,
                kind: "transaction"
            };
            const operations = yield appendRevealOperation(network, keyStore, sourceAccount, [transaction]);
            return sendOperation(network, operations, keyStore, derivationPath);
        });
    }
    TezosOperations.sendTransactionOperation = sendTransactionOperation;
    /**
     * Creates and sends a delegation operation.
     * @param {string} network  Which Tezos network to go against
     * @param {KeyStore} keyStore   Key pair along with public key hash
     * @param {String} delegate Account ID to delegate to
     * @param {number} fee  Operation fee
     * @param {string} derivationPath BIP44 Derivation Path if signed with hardware, empty if signed with software
     * @returns {Promise<OperationResult>}  Result of the operation
     */
    function sendDelegationOperation(network, keyStore, delegate, fee, derivationPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const blockHead = yield TezosNodeQuery_1.TezosNode.getBlockHead(network);
            const account = yield TezosNodeQuery_1.TezosNode.getAccountForBlock(network, blockHead.hash, keyStore.publicKeyHash);
            const delegation = {
                kind: "delegation",
                source: keyStore.publicKeyHash,
                fee: fee.toString(),
                counter: (Number(account.counter) + 1).toString(),
                storage_limit: '0',
                gas_limit: '10000',
                delegate: delegate
            };
            const operations = yield appendRevealOperation(network, keyStore, account, [delegation]);
            return sendOperation(network, operations, keyStore, derivationPath);
        });
    }
    TezosOperations.sendDelegationOperation = sendDelegationOperation;
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
    function sendOriginationOperation(network, keyStore, amount, delegate, spendable, delegatable, fee, derivationPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const blockHead = yield TezosNodeQuery_1.TezosNode.getBlockHead(network);
            const account = yield TezosNodeQuery_1.TezosNode.getAccountForBlock(network, blockHead.hash, keyStore.publicKeyHash);
            const origination = {
                kind: "origination",
                source: keyStore.publicKeyHash,
                fee: fee.toString(),
                counter: (Number(account.counter) + 1).toString(),
                gas_limit: '10160',
                storage_limit: '277',
                managerPubkey: keyStore.publicKeyHash,
                //manager_pubkey: keyStore.publicKeyHash,  // zeronet
                balance: amount.toString(),
                spendable: spendable,
                delegatable: delegatable,
                delegate: delegate
            };
            const operations = yield appendRevealOperation(network, keyStore, account, [origination]);
            return sendOperation(network, operations, keyStore, derivationPath);
        });
    }
    TezosOperations.sendOriginationOperation = sendOriginationOperation;
    /**
     * Indicates whether an account is implicit and empty. If true, transaction will burn 0.257tz.
     * @param {string} network  Which Tezos network to go against
     * @param {KeyStore} keyStore   Key pair along with public key hash
     * @returns {Promise<boolean>}  Result
     */
    function isImplicitAndEmpty(network, accountHash) {
        return __awaiter(this, void 0, void 0, function* () {
            const blockHead = yield TezosNodeQuery_1.TezosNode.getBlockHead(network);
            const account = yield TezosNodeQuery_1.TezosNode.getAccountForBlock(network, blockHead.hash, accountHash);
            const isImplicit = accountHash.toLowerCase().startsWith("tz");
            const isEmpty = account.balance == 0;
            return (isImplicit && isEmpty);
        });
    }
    TezosOperations.isImplicitAndEmpty = isImplicitAndEmpty;
    /**
     * Indicates whether a reveal operation has already been done for a given account.
     * @param {string} network  Which Tezos network to go against
     * @param {KeyStore} keyStore   Key pair along with public key hash
     * @returns {Promise<boolean>}  Result
     */
    function isManagerKeyRevealedForAccount(network, keyStore) {
        return __awaiter(this, void 0, void 0, function* () {
            const blockHead = yield TezosNodeQuery_1.TezosNode.getBlockHead(network);
            const managerKey = yield TezosNodeQuery_1.TezosNode.getAccountManagerForBlock(network, blockHead.hash, keyStore.publicKeyHash);
            return managerKey.key != null;
        });
    }
    TezosOperations.isManagerKeyRevealedForAccount = isManagerKeyRevealedForAccount;
    /**
     * Creates and sends a reveal operation.
     * @param {string} network  Which Tezos network to go against
     * @param {KeyStore} keyStore   Key pair along with public key hash
     * @param {number} fee  Fee to pay
     * @param {string} derivationPath BIP44 Derivation Path if signed with hardware, empty if signed with software
     * @returns {Promise<OperationResult>}  Result of the operation
     */
    function sendKeyRevealOperation(network, keyStore, fee, derivationPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const blockHead = yield TezosNodeQuery_1.TezosNode.getBlockHead(network);
            const account = yield TezosNodeQuery_1.TezosNode.getAccountForBlock(network, blockHead.hash, keyStore.publicKeyHash);
            const revealOp = {
                kind: "reveal",
                source: keyStore.publicKeyHash,
                fee: '1300',
                counter: (Number(account.counter) + 1).toString(),
                gas_limit: '10000',
                storage_limit: '0',
                public_key: keyStore.publicKey
            };
            const operations = [revealOp];
            return sendOperation(network, operations, keyStore, derivationPath);
        });
    }
    TezosOperations.sendKeyRevealOperation = sendKeyRevealOperation;
    /**
     * Creates and sends an activation operation.
     * @param {string} network  Which Tezos network to go against
     * @param {KeyStore} keyStore   Key pair along with public key hash
     * @param {string} activationCode   Activation code provided by fundraiser process
     * @param {string} derivationPath BIP44 Derivation Path if signed with hardware, empty if signed with software
     * @returns {Promise<OperationResult>}  Result of the operation
     */
    function sendIdentityActivationOperation(network, keyStore, activationCode, derivationPath) {
        const activation = {
            kind: "activate_account",
            pkh: keyStore.publicKeyHash,
            secret: activationCode
        };
        const operations = [activation];
        return sendOperation(network, operations, keyStore, derivationPath);
    }
    TezosOperations.sendIdentityActivationOperation = sendIdentityActivationOperation;
})(TezosOperations = exports.TezosOperations || (exports.TezosOperations = {}));
//# sourceMappingURL=TezosOperations.js.map
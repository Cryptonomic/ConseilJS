"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const KeyStore_1 = require("../../types/wallet/KeyStore");
const TezosNodeReader_1 = require("./TezosNodeReader");
const TezosMessageCodec_1 = require("./TezosMessageCodec");
const TezosMessageUtil_1 = require("./TezosMessageUtil");
const CryptoUtils_1 = require("../../utils/CryptoUtils");
const FetchSelector_1 = __importDefault(require("../../utils/FetchSelector"));
const fetch = FetchSelector_1.default.getFetch();
const DeviceSelector_1 = __importDefault(require("../../utils/DeviceSelector"));
let LedgerUtils = DeviceSelector_1.default.getLedgerUtils();
var TezosNodeWriter;
(function (TezosNodeWriter) {
    function performPostRequest(server, command, payload = {}) {
        const url = `${server}/${command}`;
        const payloadStr = JSON.stringify(payload);
        return fetch(url, { method: 'post', body: payloadStr, headers: { 'content-type': 'application/json' } });
    }
    function signOperationGroup(forgedOperation, keyStore, derivationPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const watermark = '03';
            const watermarkedForgedOperationBytesHex = watermark + forgedOperation;
            let opSignature;
            switch (keyStore.storeType) {
                case KeyStore_1.StoreType.Hardware:
                    opSignature = yield LedgerUtils.signTezosOperation(derivationPath, watermarkedForgedOperationBytesHex);
                    break;
                default:
                    const hashedWatermarkedOpBytes = CryptoUtils_1.CryptoUtils.simpleHash(Buffer.from(watermarkedForgedOperationBytesHex, 'hex'), 32);
                    const privateKeyBytes = TezosMessageUtil_1.TezosMessageUtils.writeKeyWithHint(keyStore.privateKey, "edsk");
                    opSignature = yield CryptoUtils_1.CryptoUtils.signDetached(hashedWatermarkedOpBytes, privateKeyBytes);
            }
            const hexSignature = TezosMessageUtil_1.TezosMessageUtils.readSignatureWithHint(opSignature, "edsig").toString();
            const signedOpBytes = Buffer.concat([Buffer.from(forgedOperation, 'hex'), Buffer.from(opSignature)]);
            return { bytes: signedOpBytes, signature: hexSignature.toString() };
        });
    }
    TezosNodeWriter.signOperationGroup = signOperationGroup;
    function forgeOperations(blockHead, operations) {
        let encoded = TezosMessageUtil_1.TezosMessageUtils.writeBranch(blockHead.hash);
        operations.forEach(m => encoded += TezosMessageCodec_1.TezosMessageCodec.encodeOperation(m));
        const optypes = Array.from(operations.map(o => o["kind"]));
        let validate = false;
        for (let t of optypes) {
            validate = ["reveal", "transaction", "delegation", "origination"].includes(t);
            if (validate) {
                break;
            }
        }
        if (validate) {
            let decoded = TezosMessageCodec_1.TezosMessageCodec.parseOperationGroup(encoded);
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
        return encoded;
    }
    TezosNodeWriter.forgeOperations = forgeOperations;
    function applyOperation(server, blockHead, operations, signedOpGroup) {
        return __awaiter(this, void 0, void 0, function* () {
            const payload = [{
                    protocol: blockHead.protocol,
                    branch: blockHead.hash,
                    contents: operations,
                    signature: signedOpGroup.signature
                }];
            const response = yield performPostRequest(server, 'chains/main/blocks/head/helpers/preapply/operations', payload);
            const json = yield response.json();
            return json;
        });
    }
    TezosNodeWriter.applyOperation = applyOperation;
    function checkAppliedOperationResults(appliedOp) {
        const validAppliedKinds = new Set(['activate_account', 'reveal', 'transaction', 'origination', 'delegation']);
        const firstAppliedOp = appliedOp[0];
        if (firstAppliedOp.kind != null && !validAppliedKinds.has(firstAppliedOp.kind)) {
            throw new Error(`Could not apply operation because: ${firstAppliedOp.id}`);
        }
        for (const op of firstAppliedOp.contents) {
            if (!validAppliedKinds.has(op.kind)) {
                throw new Error(`Could not apply operation because: ${op.metadata}`);
            }
        }
    }
    function injectOperation(server, signedOpGroup) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield performPostRequest(server, 'injection/operation?chain=main', signedOpGroup.bytes.toString('hex'));
            const injectedOperation = yield response.text();
            return injectedOperation;
        });
    }
    TezosNodeWriter.injectOperation = injectOperation;
    function sendOperation(server, operations, keyStore, derivationPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const blockHead = yield TezosNodeReader_1.TezosNodeReader.getBlockHead(server);
            const forgedOperationGroup = forgeOperations(blockHead, operations);
            const signedOpGroup = yield signOperationGroup(forgedOperationGroup, keyStore, derivationPath);
            const appliedOp = yield applyOperation(server, blockHead, operations, signedOpGroup);
            checkAppliedOperationResults(appliedOp);
            const injectedOperation = yield injectOperation(server, signedOpGroup);
            return { results: appliedOp[0], operationGroupID: injectedOperation };
        });
    }
    TezosNodeWriter.sendOperation = sendOperation;
    function appendRevealOperation(server, keyStore, account, operations) {
        return __awaiter(this, void 0, void 0, function* () {
            const isManagerKeyRevealed = yield isManagerKeyRevealedForAccount(server, keyStore);
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
    TezosNodeWriter.appendRevealOperation = appendRevealOperation;
    function sendTransactionOperation(server, keyStore, to, amount, fee, derivationPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const blockHead = yield TezosNodeReader_1.TezosNodeReader.getBlockHead(server);
            const sourceAccount = yield TezosNodeReader_1.TezosNodeReader.getAccountForBlock(server, blockHead.hash, keyStore.publicKeyHash);
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
            const operations = yield appendRevealOperation(server, keyStore, sourceAccount, [transaction]);
            return sendOperation(server, operations, keyStore, derivationPath);
        });
    }
    TezosNodeWriter.sendTransactionOperation = sendTransactionOperation;
    function sendDelegationOperation(server, keyStore, delegate, fee, derivationPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const blockHead = yield TezosNodeReader_1.TezosNodeReader.getBlockHead(server);
            const account = yield TezosNodeReader_1.TezosNodeReader.getAccountForBlock(server, blockHead.hash, keyStore.publicKeyHash);
            const delegation = {
                kind: "delegation",
                source: keyStore.publicKeyHash,
                fee: fee.toString(),
                counter: (Number(account.counter) + 1).toString(),
                storage_limit: '0',
                gas_limit: '10000',
                delegate: delegate
            };
            const operations = yield appendRevealOperation(server, keyStore, account, [delegation]);
            return sendOperation(server, operations, keyStore, derivationPath);
        });
    }
    TezosNodeWriter.sendDelegationOperation = sendDelegationOperation;
    function sendAccountOriginationOperation(server, keyStore, amount, delegate, spendable, delegatable, fee, derivationPath) {
        return __awaiter(this, void 0, void 0, function* () {
            return sendOriginationOperation(server, keyStore, amount, delegate, spendable, delegatable, fee, derivationPath, '277', '10160');
        });
    }
    TezosNodeWriter.sendAccountOriginationOperation = sendAccountOriginationOperation;
    function sendContractOriginationOperation(server, keyStore, amount, delegate, spendable, delegatable, fee, derivationPath, storage_limit, gas_limit, code, storage) {
        return __awaiter(this, void 0, void 0, function* () {
            return sendOriginationOperation(server, keyStore, amount, delegate, spendable, delegatable, fee, derivationPath, storage_limit, gas_limit, code, storage);
        });
    }
    TezosNodeWriter.sendContractOriginationOperation = sendContractOriginationOperation;
    function sendOriginationOperation(server, keyStore, amount, delegate, spendable, delegatable, fee, derivationPath, storage_limit, gas_limit, code, storage) {
        return __awaiter(this, void 0, void 0, function* () {
            const blockHead = yield TezosNodeReader_1.TezosNodeReader.getBlockHead(server);
            const account = yield TezosNodeReader_1.TezosNodeReader.getAccountForBlock(server, blockHead.hash, keyStore.publicKeyHash);
            const origination = {
                kind: "origination",
                source: keyStore.publicKeyHash,
                fee: fee.toString(),
                counter: (Number(account.counter) + 1).toString(),
                gas_limit: gas_limit,
                storage_limit: storage_limit,
                managerPubkey: keyStore.publicKeyHash,
                balance: amount.toString(),
                spendable: spendable,
                delegatable: delegatable,
                delegate: delegate,
                script: code ? { code: code, storage: storage } : undefined
            };
            const operations = yield appendRevealOperation(server, keyStore, account, [origination]);
            return sendOperation(server, operations, keyStore, derivationPath);
        });
    }
    function sendContractInvocationOperation(server, keyStore, to, amount, fee, derivationPath, storageLimit, gasLimit, parameters) {
        return __awaiter(this, void 0, void 0, function* () {
            const blockHead = yield TezosNodeReader_1.TezosNodeReader.getBlockHead(server);
            const sourceAccount = yield TezosNodeReader_1.TezosNodeReader.getAccountForBlock(server, blockHead.hash, keyStore.publicKeyHash);
            const transaction = {
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
            const operations = yield appendRevealOperation(server, keyStore, sourceAccount, [transaction]);
            return sendOperation(server, operations, keyStore, derivationPath);
        });
    }
    TezosNodeWriter.sendContractInvocationOperation = sendContractInvocationOperation;
    function isImplicitAndEmpty(server, accountHash) {
        return __awaiter(this, void 0, void 0, function* () {
            const blockHead = yield TezosNodeReader_1.TezosNodeReader.getBlockHead(server);
            const account = yield TezosNodeReader_1.TezosNodeReader.getAccountForBlock(server, blockHead.hash, accountHash);
            const isImplicit = accountHash.toLowerCase().startsWith("tz");
            const isEmpty = Number(account.balance) === 0;
            return (isImplicit && isEmpty);
        });
    }
    TezosNodeWriter.isImplicitAndEmpty = isImplicitAndEmpty;
    function isManagerKeyRevealedForAccount(server, keyStore) {
        return __awaiter(this, void 0, void 0, function* () {
            const blockHead = yield TezosNodeReader_1.TezosNodeReader.getBlockHead(server);
            const managerKey = yield TezosNodeReader_1.TezosNodeReader.getAccountManagerForBlock(server, blockHead.hash, keyStore.publicKeyHash);
            return managerKey.key != null;
        });
    }
    TezosNodeWriter.isManagerKeyRevealedForAccount = isManagerKeyRevealedForAccount;
    function sendKeyRevealOperation(server, keyStore, fee, derivationPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const blockHead = yield TezosNodeReader_1.TezosNodeReader.getBlockHead(server);
            const account = yield TezosNodeReader_1.TezosNodeReader.getAccountForBlock(server, blockHead.hash, keyStore.publicKeyHash);
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
            return sendOperation(server, operations, keyStore, derivationPath);
        });
    }
    TezosNodeWriter.sendKeyRevealOperation = sendKeyRevealOperation;
    function sendIdentityActivationOperation(server, keyStore, activationCode, derivationPath) {
        const activation = { kind: "activate_account", pkh: keyStore.publicKeyHash, secret: activationCode };
        return sendOperation(server, [activation], keyStore, derivationPath);
    }
    TezosNodeWriter.sendIdentityActivationOperation = sendIdentityActivationOperation;
})(TezosNodeWriter = exports.TezosNodeWriter || (exports.TezosNodeWriter = {}));
//# sourceMappingURL=TezosNodeWriter.js.map
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
const TezosLanguageUtil_1 = require("./TezosLanguageUtil");
const CryptoUtils_1 = require("../../utils/CryptoUtils");
const FetchSelector_1 = __importDefault(require("../../utils/FetchSelector"));
const fetch = FetchSelector_1.default.getFetch();
const DeviceSelector_1 = __importDefault(require("../../utils/DeviceSelector"));
let LedgerUtils = DeviceSelector_1.default.getLedgerUtils();
const LoggerSelector_1 = __importDefault(require("../../utils/LoggerSelector"));
const log = LoggerSelector_1.default.getLogger();
var TezosNodeWriter;
(function (TezosNodeWriter) {
    function performPostRequest(server, command, payload = {}) {
        const url = `${server}/${command}`;
        const payloadStr = JSON.stringify(payload);
        log.debug(`TezosNodeWriter.performPostRequest sending ${payloadStr}\n->\n${url}`);
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
                    const privateKeyBytes = TezosMessageUtil_1.TezosMessageUtils.writeKeyWithHint(keyStore.privateKey, 'edsk');
                    opSignature = yield CryptoUtils_1.CryptoUtils.signDetached(hashedWatermarkedOpBytes, privateKeyBytes);
            }
            const hexSignature = TezosMessageUtil_1.TezosMessageUtils.readSignatureWithHint(opSignature, 'edsig').toString();
            const signedOpBytes = Buffer.concat([Buffer.from(forgedOperation, 'hex'), Buffer.from(opSignature)]);
            return { bytes: signedOpBytes, signature: hexSignature.toString() };
        });
    }
    TezosNodeWriter.signOperationGroup = signOperationGroup;
    function forgeOperations(blockHead, operations) {
        log.debug('TezosNodeWriter.forgeOperations:');
        log.debug(operations);
        let encoded = TezosMessageUtil_1.TezosMessageUtils.writeBranch(blockHead.hash);
        operations.forEach(m => encoded += TezosMessageCodec_1.TezosMessageCodec.encodeOperation(m));
        return encoded;
    }
    TezosNodeWriter.forgeOperations = forgeOperations;
    function forgeOperationsRemotely(server, blockHead, operations) {
        return __awaiter(this, void 0, void 0, function* () {
            log.debug('TezosNodeWriter.forgeOperations:');
            log.debug(operations);
            log.warn('forgeOperationsRemotely() is not intrinsically trustless');
            const response = yield performPostRequest(server, 'chains/main/blocks/head/helpers/forge/operations', { branch: blockHead.hash, contents: operations });
            const forgedOperation = yield response.text();
            const ops = forgedOperation.replace(/\n/g, '').replace(/['"]+/g, '');
            let optypes = Array.from(operations.map(o => o["kind"]));
            let validate = false;
            for (let t in optypes) {
                validate = ['reveal', 'transaction', 'delegation', 'origination'].includes(t);
                if (validate) {
                    break;
                }
            }
            if (validate) {
                const decoded = TezosMessageCodec_1.TezosMessageCodec.parseOperationGroup(ops);
                for (let i = 0; i < operations.length; i++) {
                    const clientop = operations[i];
                    const serverop = decoded[i];
                    if (clientop['kind'] === 'transaction') {
                        if (serverop.kind !== clientop['kind'] || serverop.fee !== clientop['fee'] || serverop.amount !== clientop['amount'] || serverop.destination !== clientop['destination']) {
                            throw new Error('Forged transaction failed validation.');
                        }
                    }
                    else if (clientop['kind'] === 'delegation') {
                        if (serverop.kind !== clientop['kind'] || serverop.fee !== clientop['fee'] || serverop.delegate !== clientop['delegate']) {
                            throw new Error('Forged delegation failed validation.');
                        }
                    }
                    else if (clientop['kind'] === 'origination') {
                        if (serverop.kind !== clientop['kind'] || serverop.fee !== clientop['fee'] || serverop.balance !== clientop['balance'] || serverop.spendable !== clientop['spendable'] || serverop.delegatable !== clientop['delegatable'] || serverop.delegate !== clientop['delegate'] || serverop.script !== undefined) {
                            throw new Error('Forged origination failed validation.');
                        }
                    }
                }
            }
            return ops;
        });
    }
    TezosNodeWriter.forgeOperationsRemotely = forgeOperationsRemotely;
    function applyOperation(server, blockHead, operations, signedOpGroup) {
        return __awaiter(this, void 0, void 0, function* () {
            const payload = [{
                    protocol: blockHead.protocol,
                    branch: blockHead.hash,
                    contents: operations,
                    signature: signedOpGroup.signature
                }];
            const response = yield performPostRequest(server, 'chains/main/blocks/head/helpers/preapply/operations', payload);
            const text = yield response.text();
            try {
                log.debug(`TezosNodeWriter.applyOperation received ${text}`);
                const json = JSON.parse(text);
                return json;
            }
            catch (err) {
                log.error(`TezosNodeWriter.applyOperation failed to parse response`);
                throw new Error(`Could not parse JSON response from chains/main/blocks/head/helpers/preapply/operation: '${text}' for ${payload}`);
            }
        });
    }
    TezosNodeWriter.applyOperation = applyOperation;
    function checkAppliedOperationResults(appliedOp) {
        const validAppliedKinds = new Set(['activate_account', 'reveal', 'transaction', 'origination', 'delegation']);
        const firstAppliedOp = appliedOp[0];
        if (firstAppliedOp.kind != null && !validAppliedKinds.has(firstAppliedOp.kind)) {
            log.error(`TezosNodeWriter.checkAppliedOperationResults failed with ${firstAppliedOp.id}`);
            throw new Error(`Could not apply operation because ${firstAppliedOp.id}`);
        }
        for (const op of firstAppliedOp.contents) {
            if (!validAppliedKinds.has(op.kind)) {
                log.error(`TezosNodeWriter.checkAppliedOperationResults failed with ${op.metadata}`);
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
    function appendRevealOperation(server, keyStore, accountHash, accountOperationIndex, operations) {
        return __awaiter(this, void 0, void 0, function* () {
            const isKeyRevealed = yield TezosNodeReader_1.TezosNodeReader.isManagerKeyRevealedForAccount(server, accountHash);
            const counter = accountOperationIndex + 1;
            if (!isKeyRevealed) {
                const revealOp = {
                    kind: 'reveal',
                    source: accountHash,
                    fee: '0',
                    counter: counter.toString(),
                    gas_limit: '10600',
                    storage_limit: '0',
                    public_key: keyStore.publicKey
                };
                operations.forEach((operation, index) => {
                    const c = accountOperationIndex + 2 + index;
                    operation.counter = c.toString();
                });
                return [revealOp, ...operations];
            }
            return operations;
        });
    }
    TezosNodeWriter.appendRevealOperation = appendRevealOperation;
    function sendTransactionOperation(server, keyStore, to, amount, fee, derivationPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const counter = (yield TezosNodeReader_1.TezosNodeReader.getCounterForAccount(server, keyStore.publicKeyHash)) + 1;
            const transaction = {
                destination: to,
                amount: amount.toString(),
                storage_limit: '300',
                gas_limit: '10600',
                counter: counter.toString(),
                fee: fee.toString(),
                source: keyStore.publicKeyHash,
                kind: 'transaction'
            };
            const operations = yield appendRevealOperation(server, keyStore, keyStore.publicKeyHash, counter - 1, [transaction]);
            return sendOperation(server, operations, keyStore, derivationPath);
        });
    }
    TezosNodeWriter.sendTransactionOperation = sendTransactionOperation;
    function sendDelegationOperation(server, keyStore, delegator, delegate, fee = 1258, derivationPath = '') {
        return __awaiter(this, void 0, void 0, function* () {
            const counter = (yield TezosNodeReader_1.TezosNodeReader.getCounterForAccount(server, delegator)) + 1;
            const delegation = {
                kind: 'delegation',
                source: delegator,
                fee: fee.toString(),
                counter: counter.toString(),
                storage_limit: '0',
                gas_limit: '10000',
                delegate: delegate
            };
            const operations = yield appendRevealOperation(server, keyStore, delegator, counter - 1, [delegation]);
            return sendOperation(server, operations, keyStore, derivationPath);
        });
    }
    TezosNodeWriter.sendDelegationOperation = sendDelegationOperation;
    function sendUndelegationOperation(server, keyStore, delegator, delegate, fee = 1258, derivationPath = '') {
        return __awaiter(this, void 0, void 0, function* () {
            return sendDelegationOperation(server, keyStore, delegator, undefined, fee, derivationPath);
        });
    }
    TezosNodeWriter.sendUndelegationOperation = sendUndelegationOperation;
    function sendAccountOriginationOperation(server, keyStore, amount, delegate, spendable, delegatable, fee = 1266, derivationPath = '') {
        return __awaiter(this, void 0, void 0, function* () {
            return sendOriginationOperation(server, keyStore, amount, delegate, spendable, delegatable, fee, derivationPath, '277', '10600');
        });
    }
    TezosNodeWriter.sendAccountOriginationOperation = sendAccountOriginationOperation;
    function sendContractOriginationOperation(server, keyStore, amount, delegate, spendable, delegatable, fee, derivationPath, storage_limit, gas_limit, code, storage) {
        return __awaiter(this, void 0, void 0, function* () {
            if (spendable) {
                log.warn('As of protocol 004-Pt24m4xi, contracts with code cannot be "spendable"');
            }
            return sendOriginationOperation(server, keyStore, amount, delegate, spendable, delegatable, fee, derivationPath, storage_limit, gas_limit, code, storage);
        });
    }
    TezosNodeWriter.sendContractOriginationOperation = sendContractOriginationOperation;
    function sendOriginationOperation(server, keyStore, amount, delegate, spendable, delegatable, fee, derivationPath, storage_limit, gas_limit, code, storage) {
        return __awaiter(this, void 0, void 0, function* () {
            const counter = (yield TezosNodeReader_1.TezosNodeReader.getCounterForAccount(server, keyStore.publicKeyHash)) + 1;
            let parsedCode = undefined;
            if (!!code) {
                parsedCode = JSON.parse(TezosLanguageUtil_1.TezosLanguageUtil.translateMichelsonToMicheline(code));
                log.debug(`TezosNodeWriter.sendOriginationOperation code translation:\n${code}\n->\n${JSON.stringify(parsedCode)}`);
            }
            let parsedStorage = undefined;
            if (!!storage) {
                parsedStorage = JSON.parse(TezosLanguageUtil_1.TezosLanguageUtil.translateMichelsonToMicheline(storage));
                log.debug(`TezosNodeWriter.sendOriginationOperation storage translation:\n${storage}\n->\n${JSON.stringify(parsedStorage)}`);
            }
            const origination = {
                kind: 'origination',
                source: keyStore.publicKeyHash,
                fee: fee.toString(),
                counter: counter.toString(),
                gas_limit: gas_limit,
                storage_limit: storage_limit,
                manager_pubkey: keyStore.publicKeyHash,
                balance: amount.toString(),
                spendable: spendable,
                delegatable: delegatable && !!delegate,
                delegate: delegate,
                script: code ? { code: parsedCode, storage: parsedStorage } : undefined
            };
            const operations = yield appendRevealOperation(server, keyStore, keyStore.publicKeyHash, counter - 1, [origination]);
            return sendOperation(server, operations, keyStore, derivationPath);
        });
    }
    function sendContractInvocationOperation(server, keyStore, to, amount, fee, derivationPath, storageLimit, gasLimit, parameters) {
        return __awaiter(this, void 0, void 0, function* () {
            const counter = (yield TezosNodeReader_1.TezosNodeReader.getCounterForAccount(server, keyStore.publicKeyHash)) + 1;
            let transaction = {
                destination: to,
                amount: amount.toString(),
                storage_limit: storageLimit.toString(),
                gas_limit: gasLimit.toString(),
                counter: counter.toString(),
                fee: fee.toString(),
                source: keyStore.publicKeyHash,
                kind: 'transaction'
            };
            if (!!parameters) {
                const michelineParams = TezosLanguageUtil_1.TezosLanguageUtil.translateMichelsonToMicheline(parameters);
                transaction.parameters = JSON.parse(michelineParams);
            }
            const operations = yield appendRevealOperation(server, keyStore, keyStore.publicKeyHash, counter - 1, [transaction]);
            return sendOperation(server, operations, keyStore, derivationPath);
        });
    }
    TezosNodeWriter.sendContractInvocationOperation = sendContractInvocationOperation;
    function sendKeyRevealOperation(server, keyStore, fee = 1270, derivationPath = '') {
        return __awaiter(this, void 0, void 0, function* () {
            const counter = (yield TezosNodeReader_1.TezosNodeReader.getCounterForAccount(server, keyStore.publicKeyHash)) + 1;
            const revealOp = {
                kind: 'reveal',
                source: keyStore.publicKeyHash,
                fee: fee + '',
                counter: counter.toString(),
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
        const activation = { kind: 'activate_account', pkh: keyStore.publicKeyHash, secret: activationCode };
        return sendOperation(server, [activation], keyStore, derivationPath);
    }
    TezosNodeWriter.sendIdentityActivationOperation = sendIdentityActivationOperation;
})(TezosNodeWriter = exports.TezosNodeWriter || (exports.TezosNodeWriter = {}));
//# sourceMappingURL=TezosNodeWriter.js.map
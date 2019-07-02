"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TezosMessageUtil_1 = require("./TezosMessageUtil");
const TezosLanguageUtil_1 = require("./TezosLanguageUtil");
const operationTypes = [
    "endorsement",
    "seedNonceRevelation",
    "doubleEndorsementEvidence",
    "doubleBakingEvidence",
    "accountActivation",
    "proposal",
    "ballot",
    "reveal",
    "transaction",
    "origination",
    "delegation"
];
var TezosMessageCodec;
(function (TezosMessageCodec) {
    function getOperationType(hex) {
        return operationTypes[TezosMessageUtil_1.TezosMessageUtils.readInt(hex)];
    }
    TezosMessageCodec.getOperationType = getOperationType;
    function idFirstOperation(hex) {
        return getOperationType(hex.substring(64, 66));
    }
    TezosMessageCodec.idFirstOperation = idFirstOperation;
    function parseOperation(hex, opType, isFirst = true) {
        switch (opType) {
            case "endorsement":
                throw new Error(`Unsupported operation type: ${opType}`);
            case "seedNonceRevelation":
                throw new Error(`Unsupported operation type: ${opType}`);
            case "doubleEndorsementEvidence":
                throw new Error(`Unsupported operation type: ${opType}`);
            case "doubleBakingEvidence":
                throw new Error(`Unsupported operation type: ${opType}`);
            case "accountActivation":
                throw new Error(`Unsupported operation type: ${opType}`);
            case "proposal":
                throw new Error(`Unsupported operation type: ${opType}`);
            case "ballot":
                return parseBallot(hex, isFirst);
            case "reveal":
                return parseReveal(hex, isFirst);
            case "transaction":
                return parseTransaction(hex, isFirst);
            case "origination":
                return parseOrigination(hex, isFirst);
            case "delegation":
                return parseDelegation(hex, isFirst);
            default:
                throw new Error(`Unsupported operation type: ${opType}`);
        }
    }
    TezosMessageCodec.parseOperation = parseOperation;
    function encodeOperation(message) {
        if (message.hasOwnProperty('pkh') && message.hasOwnProperty('secret')) {
            return encodeActivation(message);
        }
        if (message.hasOwnProperty('kind')) {
            const operation = message;
            if (operation.kind === 'reveal') {
                return encodeReveal(operation);
            }
            if (operation.kind === 'transaction') {
                return encodeTransaction(operation);
            }
            if (operation.kind === 'origination') {
                return encodeOrigination(operation);
            }
            if (operation.kind === 'delegation') {
                return encodeDelegation(operation);
            }
        }
        if (message.hasOwnProperty('vote')) {
            return encodeBallot(message);
        }
        throw new Error('Unsupported message type');
    }
    TezosMessageCodec.encodeOperation = encodeOperation;
    function encodeActivation(activation) {
        let hex = TezosMessageUtil_1.TezosMessageUtils.writeInt(operationTypes.indexOf('accountActivation'));
        hex += TezosMessageUtil_1.TezosMessageUtils.writeAddress(activation.pkh).slice(4);
        hex += activation.secret;
        return hex;
    }
    TezosMessageCodec.encodeActivation = encodeActivation;
    function parseBallot(ballotMessage, isFirst = true) {
        let hexOperationType = isFirst ? ballotMessage.substring(64, 66) : ballotMessage.substring(0, 2);
        if (getOperationType(hexOperationType) !== 'ballot') {
            throw new Error('Provided operation is not a ballot');
        }
        let fieldoffset = 0;
        let branch = '';
        if (isFirst) {
            branch = TezosMessageUtil_1.TezosMessageUtils.readBranch(ballotMessage.substring(fieldoffset, fieldoffset + 64));
            fieldoffset += 64 + 2;
        }
        else {
            fieldoffset += 2;
        }
        const source = TezosMessageUtil_1.TezosMessageUtils.readAddress(ballotMessage.substring(fieldoffset, fieldoffset + 42));
        fieldoffset += 42;
        const period = parseInt(ballotMessage.substring(fieldoffset, fieldoffset + 8), 16);
        fieldoffset += 8;
        const proposal = TezosMessageUtil_1.TezosMessageUtils.readBufferWithHint(Buffer.from(ballotMessage.substring(fieldoffset, fieldoffset + 64), 'hex'), 'p');
        fieldoffset += 64;
        const vote = parseInt(ballotMessage.substring(fieldoffset, fieldoffset + 1), 16);
        fieldoffset += 2;
        let next;
        if (ballotMessage.length > fieldoffset) {
            next = getOperationType(ballotMessage.substring(fieldoffset, fieldoffset + 2));
        }
        const ballot = {
            source: source,
            period: period,
            proposal: proposal,
            vote: vote
        };
        const envelope = {
            operation: ballot,
            branch: branch,
            next: next,
            nextoffset: next ? fieldoffset : -1
        };
        return envelope;
    }
    TezosMessageCodec.parseBallot = parseBallot;
    function encodeBallot(ballot) {
        let hex = TezosMessageUtil_1.TezosMessageUtils.writeInt(operationTypes.indexOf('ballot'));
        hex += TezosMessageUtil_1.TezosMessageUtils.writeAddress(ballot.source).slice(2);
        hex += ('00000000' + ballot.period.toString(16)).slice(-8);
        hex += TezosMessageUtil_1.TezosMessageUtils.writeBufferWithHint(ballot.proposal).toString('hex').slice(4);
        hex += ('00' + ballot.vote.toString(16)).slice(-2);
        return hex;
    }
    TezosMessageCodec.encodeBallot = encodeBallot;
    function parseReveal(revealMessage, isFirst = true) {
        let hexOperationType = isFirst ? revealMessage.substring(64, 66) : revealMessage.substring(0, 2);
        if (getOperationType(hexOperationType) !== 'reveal') {
            throw new Error('Provided operation is not a reveal.');
        }
        let fieldoffset = 0;
        let branch = '';
        if (isFirst) {
            branch = TezosMessageUtil_1.TezosMessageUtils.readBranch(revealMessage.substring(fieldoffset, fieldoffset + 64));
            fieldoffset += 64 + 2;
        }
        else {
            fieldoffset += 2;
        }
        let source = TezosMessageUtil_1.TezosMessageUtils.readAddress(revealMessage.substring(fieldoffset, fieldoffset + 44));
        fieldoffset += 44;
        let feeInfo = TezosMessageUtil_1.TezosMessageUtils.findInt(revealMessage, fieldoffset);
        fieldoffset += feeInfo.length;
        let counterInfo = TezosMessageUtil_1.TezosMessageUtils.findInt(revealMessage, fieldoffset);
        fieldoffset += counterInfo.length;
        let gasInfo = TezosMessageUtil_1.TezosMessageUtils.findInt(revealMessage, fieldoffset);
        fieldoffset += gasInfo.length;
        let storageInfo = TezosMessageUtil_1.TezosMessageUtils.findInt(revealMessage, fieldoffset);
        fieldoffset += storageInfo.length;
        let publickey = TezosMessageUtil_1.TezosMessageUtils.readPublicKey(revealMessage.substring(fieldoffset, fieldoffset + 66));
        fieldoffset += 66;
        let next;
        if (revealMessage.length > fieldoffset) {
            next = getOperationType(revealMessage.substring(fieldoffset, fieldoffset + 2));
        }
        const reveal = {
            kind: "reveal",
            source: source,
            public_key: publickey,
            fee: feeInfo.value + "",
            gas_limit: gasInfo.value + "",
            storage_limit: storageInfo.value + "",
            counter: counterInfo.value + ""
        };
        const envelope = {
            operation: reveal,
            branch: branch,
            next: next,
            nextoffset: next ? fieldoffset : -1
        };
        return envelope;
    }
    TezosMessageCodec.parseReveal = parseReveal;
    function encodeReveal(reveal) {
        if (reveal.kind !== 'reveal') {
            throw new Error('Incorrect operation type.');
        }
        if (reveal.public_key === undefined) {
            throw new Error('Missing public key.');
        }
        let hex = TezosMessageUtil_1.TezosMessageUtils.writeInt(operationTypes.indexOf('reveal'));
        hex += TezosMessageUtil_1.TezosMessageUtils.writeAddress(reveal.source);
        hex += TezosMessageUtil_1.TezosMessageUtils.writeInt(parseInt(reveal.fee));
        hex += TezosMessageUtil_1.TezosMessageUtils.writeInt(parseInt(reveal.counter));
        hex += TezosMessageUtil_1.TezosMessageUtils.writeInt(parseInt(reveal.gas_limit));
        hex += TezosMessageUtil_1.TezosMessageUtils.writeInt(parseInt(reveal.storage_limit));
        hex += TezosMessageUtil_1.TezosMessageUtils.writePublicKey(reveal.public_key);
        return hex;
    }
    TezosMessageCodec.encodeReveal = encodeReveal;
    function parseTransaction(transactionMessage, isFirst = true) {
        let hexOperationType = isFirst ? transactionMessage.substring(64, 66) : transactionMessage.substring(0, 2);
        if (getOperationType(hexOperationType) !== "transaction") {
            throw new Error("Provided operation is not a transaction.");
        }
        let fieldoffset = 0;
        let branch = "";
        if (isFirst) {
            branch = TezosMessageUtil_1.TezosMessageUtils.readBranch(transactionMessage.substring(fieldoffset, fieldoffset + 64));
            fieldoffset += 64 + 2;
        }
        else {
            fieldoffset += 2;
        }
        let source = TezosMessageUtil_1.TezosMessageUtils.readAddress(transactionMessage.substring(fieldoffset, fieldoffset + 44));
        fieldoffset += 44;
        let feeInfo = TezosMessageUtil_1.TezosMessageUtils.findInt(transactionMessage, fieldoffset);
        fieldoffset += feeInfo.length;
        let counterInfo = TezosMessageUtil_1.TezosMessageUtils.findInt(transactionMessage, fieldoffset);
        fieldoffset += counterInfo.length;
        let gasInfo = TezosMessageUtil_1.TezosMessageUtils.findInt(transactionMessage, fieldoffset);
        fieldoffset += gasInfo.length;
        let storageInfo = TezosMessageUtil_1.TezosMessageUtils.findInt(transactionMessage, fieldoffset);
        fieldoffset += storageInfo.length;
        let amountInfo = TezosMessageUtil_1.TezosMessageUtils.findInt(transactionMessage, fieldoffset);
        fieldoffset += amountInfo.length;
        let target = TezosMessageUtil_1.TezosMessageUtils.readAddress(transactionMessage.substring(fieldoffset, fieldoffset + 44));
        fieldoffset += 44;
        let hasParameters = TezosMessageUtil_1.TezosMessageUtils.readBoolean(transactionMessage.substring(fieldoffset, fieldoffset + 2));
        fieldoffset += 2;
        let parameters = '';
        if (hasParameters) {
            const paramLength = parseInt(transactionMessage.substring(fieldoffset, fieldoffset + 8), 16);
            fieldoffset += 8;
            const codeEnvelope = TezosLanguageUtil_1.TezosLanguageUtil.hexToMicheline(transactionMessage.substring(fieldoffset));
            parameters = codeEnvelope.code;
            if (codeEnvelope.consumed !== paramLength * 2) {
                throw new Error('Failed to parse transaction parameters: length mismatch');
            }
            fieldoffset += paramLength * 2;
        }
        let next;
        if (transactionMessage.length > fieldoffset) {
            next = getOperationType(transactionMessage.substring(fieldoffset, fieldoffset + 2));
        }
        const transaction = {
            kind: "transaction",
            source: source,
            destination: target,
            amount: amountInfo.value.toString(),
            fee: feeInfo.value.toString(),
            gas_limit: gasInfo.value.toString(),
            storage_limit: storageInfo.value.toString(),
            counter: counterInfo.value.toString(),
            parameters: parameters
        };
        const envelope = {
            operation: transaction,
            branch: branch,
            next: next,
            nextoffset: next ? fieldoffset : -1
        };
        return envelope;
    }
    TezosMessageCodec.parseTransaction = parseTransaction;
    function encodeTransaction(transaction) {
        if (transaction.kind !== 'transaction') {
            throw new Error('Incorrect operation type');
        }
        if (transaction.amount === undefined) {
            throw new Error('Missing amount');
        }
        if (transaction.destination === undefined) {
            throw new Error('Missing destination');
        }
        let hex = TezosMessageUtil_1.TezosMessageUtils.writeInt(operationTypes.indexOf('transaction'));
        hex += TezosMessageUtil_1.TezosMessageUtils.writeAddress(transaction.source);
        hex += TezosMessageUtil_1.TezosMessageUtils.writeInt(parseInt(transaction.fee));
        hex += TezosMessageUtil_1.TezosMessageUtils.writeInt(parseInt(transaction.counter));
        hex += TezosMessageUtil_1.TezosMessageUtils.writeInt(parseInt(transaction.gas_limit));
        hex += TezosMessageUtil_1.TezosMessageUtils.writeInt(parseInt(transaction.storage_limit));
        hex += TezosMessageUtil_1.TezosMessageUtils.writeInt(parseInt(transaction.amount));
        hex += TezosMessageUtil_1.TezosMessageUtils.writeAddress(transaction.destination);
        if (!!transaction.parameters) {
            const code = TezosLanguageUtil_1.TezosLanguageUtil.normalizeMichelineWhiteSpace(JSON.stringify(transaction.parameters));
            const result = TezosLanguageUtil_1.TezosLanguageUtil.translateMichelineToHex(code);
            hex += 'ff' + ('0000000' + (result.length / 2).toString(16)).slice(-8) + result;
        }
        else {
            hex += '00';
        }
        return hex;
    }
    TezosMessageCodec.encodeTransaction = encodeTransaction;
    function parseOrigination(originationMessage, isFirst = true) {
        let hexOperationType = isFirst ? originationMessage.substring(64, 66) : originationMessage.substring(0, 2);
        if (getOperationType(hexOperationType) !== "origination") {
            throw new Error("Provided operation is not an origination.");
        }
        let fieldoffset = 0;
        let branch = "";
        if (isFirst) {
            branch = TezosMessageUtil_1.TezosMessageUtils.readBranch(originationMessage.substring(fieldoffset, fieldoffset + 64));
            fieldoffset += 64 + 2;
        }
        else {
            fieldoffset += 2;
        }
        let source = TezosMessageUtil_1.TezosMessageUtils.readAddress(originationMessage.substring(fieldoffset, fieldoffset + 44));
        fieldoffset += 44;
        let feeInfo = TezosMessageUtil_1.TezosMessageUtils.findInt(originationMessage, fieldoffset);
        fieldoffset += feeInfo.length;
        let counterInfo = TezosMessageUtil_1.TezosMessageUtils.findInt(originationMessage, fieldoffset);
        fieldoffset += counterInfo.length;
        let gasInfo = TezosMessageUtil_1.TezosMessageUtils.findInt(originationMessage, fieldoffset);
        fieldoffset += gasInfo.length;
        let storageInfo = TezosMessageUtil_1.TezosMessageUtils.findInt(originationMessage, fieldoffset);
        fieldoffset += storageInfo.length;
        let publickeyhash = TezosMessageUtil_1.TezosMessageUtils.readAddress(originationMessage.substring(fieldoffset, fieldoffset + 42));
        fieldoffset += 42;
        let balanceInfo = TezosMessageUtil_1.TezosMessageUtils.findInt(originationMessage, fieldoffset);
        fieldoffset += balanceInfo.length;
        let spendable = TezosMessageUtil_1.TezosMessageUtils.readBoolean(originationMessage.substring(fieldoffset, fieldoffset + 2));
        fieldoffset += 2;
        let delegatable = TezosMessageUtil_1.TezosMessageUtils.readBoolean(originationMessage.substring(fieldoffset, fieldoffset + 2));
        fieldoffset += 2;
        let hasDelegate = TezosMessageUtil_1.TezosMessageUtils.readBoolean(originationMessage.substring(fieldoffset, fieldoffset + 2));
        fieldoffset += 2;
        let delegate = '';
        if (hasDelegate) {
            delegate = TezosMessageUtil_1.TezosMessageUtils.readAddress(originationMessage.substring(fieldoffset, fieldoffset + 42));
            fieldoffset += 42;
        }
        let hasScript = TezosMessageUtil_1.TezosMessageUtils.readBoolean(originationMessage.substring(fieldoffset, fieldoffset + 2));
        fieldoffset += 2;
        let script = {};
        if (hasScript) {
            let codesize = parseInt(originationMessage.substring(fieldoffset, fieldoffset + 8), 16);
            fieldoffset += 8;
            const code = TezosLanguageUtil_1.TezosLanguageUtil.hexToMicheline(originationMessage.substring(fieldoffset, fieldoffset + codesize * 2)).code;
            fieldoffset += codesize * 2;
            let storagesize = parseInt(originationMessage.substring(fieldoffset, fieldoffset + 8), 16);
            fieldoffset += 8;
            const storage = TezosLanguageUtil_1.TezosLanguageUtil.hexToMicheline(originationMessage.substring(fieldoffset, fieldoffset + storagesize * 2)).code;
            fieldoffset += storagesize * 2;
            script = JSON.parse(`{ "script": [ ${code}, ${storage} ] }`);
        }
        let next;
        if (originationMessage.length > fieldoffset) {
            next = getOperationType(originationMessage.substring(fieldoffset, fieldoffset + 2));
        }
        const origination = {
            kind: "origination",
            source: source,
            manager_pubkey: publickeyhash,
            balance: balanceInfo.value + "",
            spendable: spendable,
            delegatable: delegatable,
            delegate: hasDelegate ? delegate : undefined,
            fee: feeInfo.value + "",
            gas_limit: gasInfo.value + "",
            storage_limit: storageInfo.value + "",
            counter: counterInfo.value + "",
            script: hasScript ? script : undefined,
        };
        const envelope = {
            operation: origination,
            branch: branch,
            next: next,
            nextoffset: next ? fieldoffset : -1
        };
        return envelope;
    }
    TezosMessageCodec.parseOrigination = parseOrigination;
    function encodeOrigination(origination) {
        if (origination.kind !== 'origination') {
            throw new Error('Incorrect operation type');
        }
        if (origination.manager_pubkey === undefined) {
            throw new Error('Missing manager address');
        }
        if (origination.balance === undefined) {
            throw new Error('Missing balance');
        }
        let hex = TezosMessageUtil_1.TezosMessageUtils.writeInt(operationTypes.indexOf('origination'));
        hex += TezosMessageUtil_1.TezosMessageUtils.writeAddress(origination.source);
        hex += TezosMessageUtil_1.TezosMessageUtils.writeInt(parseInt(origination.fee));
        hex += TezosMessageUtil_1.TezosMessageUtils.writeInt(parseInt(origination.counter));
        hex += TezosMessageUtil_1.TezosMessageUtils.writeInt(parseInt(origination.gas_limit));
        hex += TezosMessageUtil_1.TezosMessageUtils.writeInt(parseInt(origination.storage_limit));
        hex += TezosMessageUtil_1.TezosMessageUtils.writeAddress(origination.manager_pubkey).slice(2);
        hex += TezosMessageUtil_1.TezosMessageUtils.writeInt(parseInt(origination.balance));
        hex += origination.spendable !== undefined ? TezosMessageUtil_1.TezosMessageUtils.writeBoolean(origination.spendable) : '00';
        hex += origination.delegatable !== undefined ? TezosMessageUtil_1.TezosMessageUtils.writeBoolean(origination.delegatable) : '00';
        if (origination.delegate !== undefined) {
            hex += TezosMessageUtil_1.TezosMessageUtils.writeBoolean(true);
            hex += TezosMessageUtil_1.TezosMessageUtils.writeAddress(origination.delegate).slice(2);
        }
        else {
            hex += TezosMessageUtil_1.TezosMessageUtils.writeBoolean(false);
        }
        if (!!origination.script) {
            hex += 'ff';
            let container = origination.script;
            try {
                container = JSON.parse(JSON.stringify(origination.script));
            }
            catch (_a) { }
            let parts = [];
            parts.push(JSON.stringify(JSON.parse(container['code'])));
            parts.push(JSON.stringify(container['storage'], null, 1));
            hex += parts
                .map(p => TezosLanguageUtil_1.TezosLanguageUtil.normalizeMichelineWhiteSpace(p))
                .map(p => TezosLanguageUtil_1.TezosLanguageUtil.translateMichelineToHex(p))
                .reduce((m, p) => { return m += ('0000000' + (p.length / 2).toString(16)).slice(-8) + p; }, '');
        }
        else {
            hex += '00';
        }
        return hex;
    }
    TezosMessageCodec.encodeOrigination = encodeOrigination;
    function parseDelegation(delegationMessage, isFirst = true) {
        let hexOperationType = isFirst ? delegationMessage.substring(64, 66) : delegationMessage.substring(0, 2);
        if (getOperationType(hexOperationType) !== "delegation") {
            throw new Error("Provided operation is not a delegation.");
        }
        let fieldoffset = 0;
        let branch = "";
        if (isFirst) {
            branch = TezosMessageUtil_1.TezosMessageUtils.readBranch(delegationMessage.substring(fieldoffset, fieldoffset + 64));
            fieldoffset += 64 + 2;
        }
        else {
            fieldoffset += 2;
        }
        let source = TezosMessageUtil_1.TezosMessageUtils.readAddress(delegationMessage.substring(fieldoffset, fieldoffset + 44));
        fieldoffset += 44;
        let feeInfo = TezosMessageUtil_1.TezosMessageUtils.findInt(delegationMessage, fieldoffset);
        fieldoffset += feeInfo.length;
        let counterInfo = TezosMessageUtil_1.TezosMessageUtils.findInt(delegationMessage, fieldoffset);
        fieldoffset += counterInfo.length;
        let gasInfo = TezosMessageUtil_1.TezosMessageUtils.findInt(delegationMessage, fieldoffset);
        fieldoffset += gasInfo.length;
        let storageInfo = TezosMessageUtil_1.TezosMessageUtils.findInt(delegationMessage, fieldoffset);
        fieldoffset += storageInfo.length;
        let hasDelegate = TezosMessageUtil_1.TezosMessageUtils.readBoolean(delegationMessage.substring(fieldoffset, fieldoffset + 2));
        fieldoffset += 2;
        let delegate = '';
        if (hasDelegate) {
            delegate = TezosMessageUtil_1.TezosMessageUtils.readAddress(delegationMessage.substring(fieldoffset, fieldoffset + 42));
            fieldoffset += 42;
        }
        let next;
        if (delegationMessage.length > fieldoffset) {
            next = getOperationType(delegationMessage.substring(fieldoffset, fieldoffset + 2));
        }
        const delegation = {
            kind: "delegation",
            source: source,
            delegate: hasDelegate ? delegate : undefined,
            fee: feeInfo.value + "",
            gas_limit: gasInfo.value + "",
            storage_limit: storageInfo.value + "",
            counter: counterInfo.value + ""
        };
        const envelope = {
            operation: delegation,
            branch: branch,
            next: next,
            nextoffset: next ? fieldoffset : -1
        };
        return envelope;
    }
    TezosMessageCodec.parseDelegation = parseDelegation;
    function encodeDelegation(delegation) {
        if (delegation.kind !== 'delegation') {
            throw new Error('Incorrect operation type');
        }
        let hex = TezosMessageUtil_1.TezosMessageUtils.writeInt(operationTypes.indexOf('delegation'));
        hex += TezosMessageUtil_1.TezosMessageUtils.writeAddress(delegation.source);
        hex += TezosMessageUtil_1.TezosMessageUtils.writeInt(parseInt(delegation.fee));
        hex += TezosMessageUtil_1.TezosMessageUtils.writeInt(parseInt(delegation.counter));
        hex += TezosMessageUtil_1.TezosMessageUtils.writeInt(parseInt(delegation.gas_limit));
        hex += TezosMessageUtil_1.TezosMessageUtils.writeInt(parseInt(delegation.storage_limit));
        if (delegation.delegate !== undefined && delegation.delegate !== '') {
            hex += TezosMessageUtil_1.TezosMessageUtils.writeBoolean(true);
            hex += TezosMessageUtil_1.TezosMessageUtils.writeAddress(delegation.delegate).slice(2);
        }
        else {
            hex += TezosMessageUtil_1.TezosMessageUtils.writeBoolean(false);
        }
        return hex;
    }
    TezosMessageCodec.encodeDelegation = encodeDelegation;
    function parseOperationGroup(hex) {
        let operations = [];
        let envelope = parseOperation(hex, idFirstOperation(hex));
        operations.push(envelope.operation);
        let groupOffset = 0;
        while (envelope.next) {
            groupOffset += envelope.nextoffset;
            envelope = parseOperation(hex.substring(groupOffset), envelope.next, false);
            operations.push(envelope.operation);
        }
        return operations;
    }
    TezosMessageCodec.parseOperationGroup = parseOperationGroup;
})(TezosMessageCodec = exports.TezosMessageCodec || (exports.TezosMessageCodec = {}));
//# sourceMappingURL=TezosMessageCodec.js.map
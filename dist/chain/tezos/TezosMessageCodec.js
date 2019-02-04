"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TezosMessageUtil_1 = require("./TezosMessageUtil");
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
                throw new Error(`Unsupported operation type: ${opType}`);
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
    function parseReveal(revealMessage, isFirst = true) {
        let hexOperationType = isFirst ? revealMessage.substring(64, 66) : revealMessage.substring(0, 2);
        if (getOperationType(hexOperationType) !== "reveal") {
            throw new Error("Provided operation is not a reveal.");
        }
        let fieldoffset = 0;
        let branch = "";
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
        if (reveal.kind !== "reveal") {
            throw new Error("Incorrect operation type.");
        }
        if (reveal.public_key === undefined) {
            throw new Error("Missing public key.");
        }
        let hex = TezosMessageUtil_1.TezosMessageUtils.writeInt(operationTypes.indexOf("reveal"));
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
        }
        let next;
        if (transactionMessage.length > fieldoffset) {
            next = getOperationType(transactionMessage.substring(fieldoffset, fieldoffset + 2));
        }
        const transaction = {
            kind: "transaction",
            source: source,
            destination: target,
            amount: amountInfo.value + "",
            fee: feeInfo.value + "",
            gas_limit: gasInfo.value + "",
            storage_limit: storageInfo.value + "",
            counter: counterInfo.value + ""
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
        if (hasScript) {
        }
        let next;
        const origination = {
            kind: "origination",
            source: source,
            managerPubkey: publickeyhash,
            balance: balanceInfo.value + "",
            spendable: spendable,
            delegatable: delegatable,
            delegate: hasDelegate ? delegate : undefined,
            fee: feeInfo.value + "",
            gas_limit: gasInfo.value + "",
            storage_limit: storageInfo.value + "",
            counter: counterInfo.value + "",
            script: hasScript ? "script" : undefined,
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
    function parseOperationGroup(hex) {
        let operations = [];
        let envelope = parseOperation(hex, idFirstOperation(hex));
        operations.push(envelope.operation);
        while (envelope.next) {
            envelope = parseOperation(hex.substring(envelope.nextoffset), envelope.next, false);
            operations.push(envelope.operation);
        }
        return operations;
    }
    TezosMessageCodec.parseOperationGroup = parseOperationGroup;
})(TezosMessageCodec = exports.TezosMessageCodec || (exports.TezosMessageCodec = {}));
//# sourceMappingURL=TezosMessageCodec.js.map
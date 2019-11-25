import { TezosMessageUtils } from "./TezosMessageUtil";
import { TezosLanguageUtil } from "./TezosLanguageUtil";
import { Activation, Ballot, BallotVote, Transaction, Delegation, Origination, Reveal, Operation, ContractParameters } from "../../types/tezos/TezosP2PMessageTypes";

const operationTypes: Map<number, string> = new Map([
    [0, 'endorsement'],
    [1, 'seedNonceRevelation'],
    [2, 'doubleEndorsementEvidence'],
    [3, 'doubleBakingEvidence'],
    [4, 'accountActivation'],
    [5, 'proposal'],
    [6, 'ballot'],
    [7, 'reveal'],
    [8, 'transaction'],
    [9, 'origination'],
    [10, 'delegation'],
    [107, 'reveal'], // >=P005
    [108, 'transaction'], // >=P005
    [109, 'origination'], // >=P005
    [110, 'delegation'] // >=P005
]);

const sepyTnoitarepo: Map<string, number> = [...operationTypes.keys()].reduce((m, k) => { const v = operationTypes.get(k) || ''; if (m[v] > k) { return m; }  return { ...m, [v]: k } }, new Map());

export namespace TezosMessageCodec {
    /**
     * Parse operation type from a bounded hex string and translate to enum.
     * @param {string} hex 
     */
    export function getOperationType(hex: string): string {
        return operationTypes.get(TezosMessageUtils.readInt(hex)) || '';
    }

    /**
     * Get OperationType of the first operation in the OperationGroup.
     * @param {string} hex Forged message in hex format.
     */
    export function idFirstOperation(hex: string) {
        return getOperationType(hex.substring(64, 66));
    }

    /**
     * Parse an operation of unknown length, possibly containing siblings.
     * 
     * @param {string} hex Encoded message
     * @param {string} opType Operation type to parse
     * @param {boolean} isFirst Flag to indicate first operation of Operation Group
     */
    export function parseOperation(hex: string, opType: string, isFirst: boolean = true): OperationEnvelope {
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

    /**
     * "Forges" Tezos P2P messages.
     * 
     * @param {any} hex Message to encode
     * 
     * @returns {string} Hex string of the message content
     */
    export function encodeOperation(message: any): string {
        if (message.hasOwnProperty('pkh') && message.hasOwnProperty('secret')) {
            return encodeActivation(message as Activation);
        }

        if (message.hasOwnProperty('kind')) {
            const operation = message as Operation;
            if (operation.kind === 'reveal') { return encodeReveal(message as Reveal); }
            if (operation.kind === 'transaction') { return encodeTransaction(message as Transaction); }
            if (operation.kind === 'origination') { return encodeOrigination(message as Origination); }
            if (operation.kind === 'delegation') { return encodeDelegation(message as Delegation); }
        }

        if (message.hasOwnProperty('vote')) {
            return encodeBallot(message as Ballot);
        }

        throw new Error('Unsupported message type');
    }

    /**
     * "Forges" Tezos P2P Activation message. Note that to be sent to the node it will need to be added to an operation group or be prepended with a Branch.
     * 
     * @param activation Message to encode
     */
    export function encodeActivation(activation: Activation): string {
        let hex = TezosMessageUtils.writeInt(sepyTnoitarepo['accountActivation']);
        hex += TezosMessageUtils.writeAddress(activation.pkh).slice(4);
        hex += activation.secret;

        return hex;
    }

    /**
     * Parse a Ballot, tag 6, message possibly containing siblings.
     * 
     * @param {string} ballotMessage Encoded ballot message
     * @param {boolean} isFirst Flag to indicate first operation of Operation Group.
     */
    export function parseBallot(ballotMessage: string, isFirst: boolean = true): OperationEnvelope {
        let hexOperationType = isFirst ? ballotMessage.substring(64, 66) : ballotMessage.substring(0, 2);
        if (getOperationType(hexOperationType) !== 'ballot') {
            throw new Error('Provided operation is not a ballot');
        }

        let fieldoffset = 0;
        let branch = '';
        if (isFirst) {
            branch = TezosMessageUtils.readBranch(ballotMessage.substring(fieldoffset, fieldoffset + 64));
            fieldoffset += 64 + 2; // branch + type
        } else {
            fieldoffset += 2; // type
        }

        const source = TezosMessageUtils.readAddress(ballotMessage.substring(fieldoffset, fieldoffset + 42));
        fieldoffset += 42;

        const period = parseInt(ballotMessage.substring(fieldoffset, fieldoffset + 8), 16);
        fieldoffset += 8;

        const proposal = TezosMessageUtils.readBufferWithHint(Buffer.from(ballotMessage.substring(fieldoffset, fieldoffset + 64), 'hex'), 'p');
        fieldoffset += 64;

        const vote = parseInt(ballotMessage.substring(fieldoffset, fieldoffset + 1), 16) as BallotVote;
        fieldoffset += 2;

        let next;
        if (ballotMessage.length > fieldoffset) {
            next = getOperationType(ballotMessage.substring(fieldoffset, fieldoffset + 2));
        }

        const ballot: Ballot = {
            kind: 'ballot',
            source: source,
            period: period,
            proposal: proposal,
            vote: vote
        };

        const envelope: OperationEnvelope = {
            operation: ballot,
            branch: branch,
            next: next,
            nextoffset: next ? fieldoffset : -1
        }

        return envelope;
    }

    /**
     * "Forges" Tezos P2P Ballot message. Note that to be sent to the node it will need to be added to an operation group or be prepended with a Branch.
     * 
     * @param ballot Message to encode
     */
    export function encodeBallot(ballot: Ballot): string {
        let hex = TezosMessageUtils.writeInt(sepyTnoitarepo['ballot']);
        hex += TezosMessageUtils.writeAddress(ballot.source).slice(2);
        hex += ('00000000' + ballot.period.toString(16)).slice(-8);
        hex += TezosMessageUtils.writeBufferWithHint(ballot.proposal).toString('hex').slice(4);
        hex += ('00' + ballot.vote.toString(16)).slice(-2);

        return hex;
    }

    /**
     * Parse a Reveal, tag 7, message possibly containing siblings.
     * 
     * @param {string} revealMessage Encoded reveal-type message
     * @param {boolean} isFirst Flag to indicate first operation of Operation Group.
     */
    export function parseReveal(revealMessage: string, isFirst: boolean = true): OperationEnvelope {
        let hexOperationType = isFirst ? revealMessage.substring(64, 66) : revealMessage.substring(0, 2);
        if (getOperationType(hexOperationType) !== 'reveal') {
            throw new Error('Provided operation is not a reveal.');
        }

        let fieldoffset = 0;
        let branch = '';
        if (isFirst) {
            branch = TezosMessageUtils.readBranch(revealMessage.substring(fieldoffset, fieldoffset + 64));
            fieldoffset += 64 + 2; // branch + type
        } else {
            fieldoffset += 2; // type
        }

        let source = '';
        if (parseInt(hexOperationType, 16) < 100) { // pre protocol 5
            source = TezosMessageUtils.readAddress(revealMessage.substring(fieldoffset, fieldoffset + 44));
            fieldoffset += 44;
        } else { // post protocol 5
            source = TezosMessageUtils.readAddress(revealMessage.substring(fieldoffset, fieldoffset + 42));
            fieldoffset += 42;
        }

        let feeInfo = TezosMessageUtils.findInt(revealMessage, fieldoffset);

        fieldoffset += feeInfo.length;
        let counterInfo = TezosMessageUtils.findInt(revealMessage, fieldoffset);

        fieldoffset += counterInfo.length;
        let gasInfo = TezosMessageUtils.findInt(revealMessage, fieldoffset);

        fieldoffset += gasInfo.length;
        let storageInfo = TezosMessageUtils.findInt(revealMessage, fieldoffset);
        fieldoffset += storageInfo.length;

        let publickey = TezosMessageUtils.readPublicKey(revealMessage.substring(fieldoffset, fieldoffset + 66));
        fieldoffset += 66;

        let next;
        if (revealMessage.length > fieldoffset) {
            next = getOperationType(revealMessage.substring(fieldoffset, fieldoffset + 2));
        }

        const reveal: Operation = {
            kind: "reveal",
            source: source,
            public_key: publickey,
            fee: feeInfo.value + "",
            gas_limit: gasInfo.value + "",
            storage_limit: storageInfo.value + "",
            counter: counterInfo.value + ""
        };

        const envelope: OperationEnvelope = {
            operation: reveal,
            branch: branch,
            next: next,
            nextoffset: next ? fieldoffset : -1
        }

        return envelope;
    }

    /**
     * Creates a hex string for the provided reveal operation. Note that to be sent to the node it will need to be added to an operation group or be prepended with a Branch.
     * 
     * @param {string} reveal A reveal operation to be encoded.
     */
    export function encodeReveal(reveal: Reveal): string {
        if (reveal.kind !== 'reveal') { throw new Error('Incorrect operation type.'); }

        let hex = TezosMessageUtils.writeInt(sepyTnoitarepo['reveal']);
        hex += TezosMessageUtils.writeAddress(reveal.source).slice(2);
        hex += TezosMessageUtils.writeInt(parseInt(reveal.fee));
        hex += TezosMessageUtils.writeInt(parseInt(reveal.counter));
        hex += TezosMessageUtils.writeInt(parseInt(reveal.gas_limit));
        hex += TezosMessageUtils.writeInt(parseInt(reveal.storage_limit));
        hex += TezosMessageUtils.writePublicKey(reveal.public_key);

        return hex;
    }

    /**
     * Parse a Transaction, tag 8, message possibly containing siblings.
     * 
     * @param {string} transactionMessage Encoded transaction-type message
     * @param {boolean} isFirst Flag to indicate first operation of Operation Group.
     */
    export function parseTransaction(transactionMessage: string, isFirst: boolean = true): OperationEnvelope {
        let hexOperationType = isFirst ? transactionMessage.substring(64, 66) : transactionMessage.substring(0, 2);
        if (getOperationType(hexOperationType) !== "transaction") {
            throw new Error("Provided operation is not a transaction.");
        }

        let fieldoffset = 0;
        let branch = "";
        if (isFirst) {
            branch = TezosMessageUtils.readBranch(transactionMessage.substring(fieldoffset, fieldoffset + 64));
            fieldoffset += 64 + 2; // branch + type
        } else {
            fieldoffset += 2; // type
        }

        let source = '';
        if (parseInt(hexOperationType, 16) < 100) { // pre protocol 5
            source = TezosMessageUtils.readAddress(transactionMessage.substring(fieldoffset, fieldoffset + 44));
            fieldoffset += 44;
        } else { // post protocol 5
            source = TezosMessageUtils.readAddress(transactionMessage.substring(fieldoffset, fieldoffset + 42));
            fieldoffset += 42;
        }

        let feeInfo = TezosMessageUtils.findInt(transactionMessage, fieldoffset);

        fieldoffset += feeInfo.length;
        let counterInfo = TezosMessageUtils.findInt(transactionMessage, fieldoffset);

        fieldoffset += counterInfo.length;
        let gasInfo = TezosMessageUtils.findInt(transactionMessage, fieldoffset);

        fieldoffset += gasInfo.length;
        let storageInfo = TezosMessageUtils.findInt(transactionMessage, fieldoffset);

        fieldoffset += storageInfo.length;
        let amountInfo = TezosMessageUtils.findInt(transactionMessage, fieldoffset);

        fieldoffset += amountInfo.length;
        let target = TezosMessageUtils.readAddress(transactionMessage.substring(fieldoffset, fieldoffset + 44));
        fieldoffset += 44;

        let hasParameters = TezosMessageUtils.readBoolean(transactionMessage.substring(fieldoffset, fieldoffset + 2));
        fieldoffset += 2;
        let parameters: string | ContractParameters = '';

        if (hasParameters && parseInt(hexOperationType, 16) < 100) { // pre protocol 5
            const paramLength = parseInt(transactionMessage.substring(fieldoffset, fieldoffset + 8), 16);
            fieldoffset += 8;
            const codeEnvelope = TezosLanguageUtil.hexToMicheline(transactionMessage.substring(fieldoffset));
            parameters = codeEnvelope.code;
            if (codeEnvelope.consumed !== paramLength * 2) { throw new Error('Failed to parse transaction parameters: length mismatch'); }
            fieldoffset += paramLength * 2;
        } else if (hasParameters && parseInt(hexOperationType, 16) > 100) { // post protocol 5
            const entrypointType = parseInt(transactionMessage.substring(fieldoffset, fieldoffset + 2), 16);
            fieldoffset += 2;

            let entrypointName = ''
            if (entrypointType === 255) {
                const endpointLength = parseInt(transactionMessage.substring(fieldoffset, fieldoffset + 2), 16);
                fieldoffset += 2;

                entrypointName = Buffer.from(transactionMessage.substring(fieldoffset, fieldoffset + endpointLength * 2), 'hex').toString();
                fieldoffset += endpointLength * 2;
            } else if (entrypointType === 0) {
                entrypointName = 'default';
            } else if (entrypointType === 1) {
                entrypointName = 'root';
            } else if (entrypointType === 2) {
                entrypointName = 'do';
            } else if (entrypointType === 3) {
                entrypointName = 'set_delegate';
            } else if (entrypointType === 4) {
                entrypointName = 'remove_delegate';
            }

            const paramLength = parseInt(transactionMessage.substring(fieldoffset, fieldoffset + 8), 16);
            fieldoffset += 8;
            const codeEnvelope = TezosLanguageUtil.hexToMicheline(transactionMessage.substring(fieldoffset));
            const endpointParameters = codeEnvelope.code;
            if (codeEnvelope.consumed !== paramLength * 2) { throw new Error('Failed to parse transaction parameters: length mismatch'); }
            fieldoffset += paramLength * 2;

            parameters = { entrypoint: entrypointName, value: endpointParameters };
        }

        let next;
        if (transactionMessage.length > fieldoffset) {
            next = getOperationType(transactionMessage.substring(fieldoffset, fieldoffset + 2));
        }

        const transaction: Operation = {
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

        const envelope: OperationEnvelope = {
            operation: transaction,
            branch: branch,
            next: next,
            nextoffset: next ? fieldoffset : -1
        }

        return envelope;
    }

    /**
     * Encodes a Transaction operation.
     * 
     * Warning, `Operation.parameters` is expected to be of type `ContractParameters`. Furthermore, `ContractParameters.entrypoint` is expected to exclude the leading '%'. Finally P005 requires that the entry point name be no more than 31 chars.
     * 
     * @param {Operation} transaction 
     * @returns {string}
     * 
     * @see {@link https://tezos.gitlab.io/mainnet/api/p2p.html#transaction-tag-8|Tezos P2P message format}
     */
    export function encodeTransaction(transaction: Transaction): string {
        if (transaction.kind !== 'transaction') { throw new Error('Incorrect operation type'); }

        let hex = TezosMessageUtils.writeInt(sepyTnoitarepo['transaction']);
        hex += TezosMessageUtils.writeAddress(transaction.source).slice(2);
        hex += TezosMessageUtils.writeInt(parseInt(transaction.fee));
        hex += TezosMessageUtils.writeInt(parseInt(transaction.counter));
        hex += TezosMessageUtils.writeInt(parseInt(transaction.gas_limit));
        hex += TezosMessageUtils.writeInt(parseInt(transaction.storage_limit));
        hex += TezosMessageUtils.writeInt(parseInt(transaction.amount));
        hex += TezosMessageUtils.writeAddress(transaction.destination);

        if (!!transaction.parameters) {
            const composite = transaction.parameters as ContractParameters;
            const code = TezosLanguageUtil.normalizeMichelineWhiteSpace(JSON.stringify(composite.value));
            const result = TezosLanguageUtil.translateMichelineToHex(code);
            hex += 'ff';

            if (composite.entrypoint === 'default') {
                hex += '00';
            } else if (composite.entrypoint === 'root') {
                hex += '01';
            } else if (composite.entrypoint === 'do') {
                hex += '02';
            } else if (composite.entrypoint === 'set_delegate') {
                hex += '03';
            } else if (composite.entrypoint === 'remove_delegate') {
                hex += '04';
            } else {
                hex += 'ff'
                    + ('0' + composite.entrypoint.length.toString(16)).slice(-2)
                    + composite.entrypoint.split('').map(c => c.charCodeAt(0).toString(16)).join('');
            }

            hex += ('0000000' + (result.length / 2).toString(16)).slice(-8) + result; // prefix byte length
        } else {
            hex += '00';
        }

        return hex;
    }

    /**
     * Parse an Origination, tag 9, message possibly containing siblings.
     * 
     * @param {string} originationMessage Encoded origination-type message
     * @param {boolean} isFirst Flag to indicate first operation of Operation Group.
     */
    export function parseOrigination(originationMessage: string, isFirst: boolean = true): OperationEnvelope {
        let hexOperationType = isFirst ? originationMessage.substring(64, 66) : originationMessage.substring(0, 2);
        if (getOperationType(hexOperationType) !== "origination") {
            throw new Error("Provided operation is not an origination.");
        }

        let fieldoffset = 0;
        let branch = "";
        if (isFirst) {
            branch = TezosMessageUtils.readBranch(originationMessage.substring(fieldoffset, fieldoffset + 64));
            fieldoffset += 64 + 2; // branch + type
        } else {
            fieldoffset += 2; // type
        }

        let source = '';
        if (parseInt(hexOperationType, 16) < 100) { // pre protocol 5
            source = TezosMessageUtils.readAddress(originationMessage.substring(fieldoffset, fieldoffset + 44));
            fieldoffset += 44;
        } else { // post protocol 5
            source = TezosMessageUtils.readAddress(originationMessage.substring(fieldoffset, fieldoffset + 42));
            fieldoffset += 42;
        }

        let feeInfo = TezosMessageUtils.findInt(originationMessage, fieldoffset);

        fieldoffset += feeInfo.length;
        let counterInfo = TezosMessageUtils.findInt(originationMessage, fieldoffset);

        fieldoffset += counterInfo.length;
        let gasInfo = TezosMessageUtils.findInt(originationMessage, fieldoffset);

        fieldoffset += gasInfo.length;
        let storageInfo = TezosMessageUtils.findInt(originationMessage, fieldoffset);
        fieldoffset += storageInfo.length;

        let manager_pubkey = ''
        if (parseInt(hexOperationType, 16) < 100) { // pre protocol 5
            manager_pubkey = TezosMessageUtils.readAddress(originationMessage.substring(fieldoffset, fieldoffset + 42));
            fieldoffset += 42;
        }

        let balanceInfo = TezosMessageUtils.findInt(originationMessage, fieldoffset);
        fieldoffset += balanceInfo.length;

        let spendable = false;
        let delegatable = false;
        if (parseInt(hexOperationType, 16) < 100) { // pre protocol 5
            spendable = TezosMessageUtils.readBoolean(originationMessage.substring(fieldoffset, fieldoffset + 2));
            fieldoffset += 2;

            delegatable = TezosMessageUtils.readBoolean(originationMessage.substring(fieldoffset, fieldoffset + 2));
            fieldoffset += 2;
        }

        let hasDelegate = TezosMessageUtils.readBoolean(originationMessage.substring(fieldoffset, fieldoffset + 2));

        fieldoffset += 2;
        let delegate = '';
        if (hasDelegate) {
            delegate = TezosMessageUtils.readAddress(originationMessage.substring(fieldoffset, fieldoffset + 42));
            fieldoffset += 42;
        }

        let hasScript = true;
        if (parseInt(hexOperationType, 16) < 100) { // pre protocol 5
            hasScript = TezosMessageUtils.readBoolean(originationMessage.substring(fieldoffset, fieldoffset + 2));
            fieldoffset += 2;
        }

        let script = {};
        if (hasScript) {
            let codesize = parseInt(originationMessage.substring(fieldoffset, fieldoffset + 8), 16);
            fieldoffset += 8;

            const code = TezosLanguageUtil.hexToMicheline(originationMessage.substring(fieldoffset, fieldoffset + codesize * 2)).code;
            fieldoffset += codesize * 2;

            let storagesize = parseInt(originationMessage.substring(fieldoffset, fieldoffset + 8), 16);
            fieldoffset += 8;

            const storage = TezosLanguageUtil.hexToMicheline(originationMessage.substring(fieldoffset, fieldoffset + storagesize * 2)).code;
            fieldoffset += storagesize * 2;

            script = JSON.parse(`{ "script": [ ${code}, ${storage} ] }`);
        }

        let next;
        if (originationMessage.length > fieldoffset) {
            next = getOperationType(originationMessage.substring(fieldoffset, fieldoffset + 2));
        }

        let origination: Operation = {
            kind: "origination",
            source: source,
            balance: balanceInfo.value + "",
            delegate: hasDelegate ? delegate : undefined,
            fee: feeInfo.value + "",
            gas_limit: gasInfo.value + "",
            storage_limit: storageInfo.value + "",
            counter: counterInfo.value + "",
            script: hasScript ? script : undefined,
        };

        if (parseInt(hexOperationType, 16) < 100) { // pre protocol 5
            origination.manager_pubkey = manager_pubkey;
            origination.spendable = spendable;
            origination.delegatable = delegatable;
        }

        const envelope: OperationEnvelope = {
            operation: origination,
            branch: branch,
            next: next,
            nextoffset: next ? fieldoffset : -1
        }

        return envelope;
    }

    /**
     * "Forges" Tezos P2P Origination message. Note that to be sent to the node it will need to be added to an operation group or be prepended with a Branch. Script parameter, if present, is expected to be in Micheline format.
     * 
     * @param origination Message to encode
     */
    export function encodeOrigination(origination: Origination): string {
        if (origination.kind !== 'origination') { throw new Error('Incorrect operation type'); }

        let hex = TezosMessageUtils.writeInt(sepyTnoitarepo['origination']);
        hex += TezosMessageUtils.writeAddress(origination.source).slice(2);
        hex += TezosMessageUtils.writeInt(parseInt(origination.fee));
        hex += TezosMessageUtils.writeInt(parseInt(origination.counter));
        hex += TezosMessageUtils.writeInt(parseInt(origination.gas_limit));
        hex += TezosMessageUtils.writeInt(parseInt(origination.storage_limit));
        hex += TezosMessageUtils.writeInt(parseInt(origination.balance));

        if (origination.delegate !== undefined) {
            hex += TezosMessageUtils.writeBoolean(true);
            hex += TezosMessageUtils.writeAddress(origination.delegate).slice(2);
        } else {
            hex += TezosMessageUtils.writeBoolean(false);
        }

        if (!!origination.script) {
            let parts: string[] = [];
            parts.push(origination.script['code']); // full contract definition containing code, storage and parameters properties
            parts.push(origination.script['storage']); // initial storage

            hex += parts
                .map(p => TezosLanguageUtil.normalizeMichelineWhiteSpace(JSON.stringify(p)))
                .map(p =>  TezosLanguageUtil.translateMichelineToHex(p))
                .reduce((m, p) => { return m += ('0000000' + (p.length / 2).toString(16)).slice(-8) + p; }, '');
        }

        return hex;
    }

    /**
     * Parse an Delegation, tag 10, message possibly containing siblings.
     * 
     * @param {string} delegationMessage Encoded delegation-type message
     * @param {boolean} isFirst Flag to indicate first operation of Operation Group.
     */
    export function parseDelegation(delegationMessage: string, isFirst: boolean = true): OperationEnvelope {
        let hexOperationType = isFirst ? delegationMessage.substring(64, 66) : delegationMessage.substring(0, 2);
        if (getOperationType(hexOperationType) !== "delegation") {
            throw new Error("Provided operation is not a delegation.");
        }

        let fieldoffset = 0;
        let branch = "";
        if (isFirst) {
            branch = TezosMessageUtils.readBranch(delegationMessage.substring(fieldoffset, fieldoffset + 64));
            fieldoffset += 64 + 2; // branch + type
        } else {
            fieldoffset += 2; // type
        }

        let source = '';
        if (parseInt(hexOperationType, 16) < 100) { // pre protocol 5
            source = TezosMessageUtils.readAddress(delegationMessage.substring(fieldoffset, fieldoffset + 44));
            fieldoffset += 44;
        } else { // post protocol 5
            source = TezosMessageUtils.readAddress(delegationMessage.substring(fieldoffset, fieldoffset + 42));
            fieldoffset += 42;
        }

        let feeInfo = TezosMessageUtils.findInt(delegationMessage, fieldoffset);

        fieldoffset += feeInfo.length;
        let counterInfo = TezosMessageUtils.findInt(delegationMessage, fieldoffset);

        fieldoffset += counterInfo.length;
        let gasInfo = TezosMessageUtils.findInt(delegationMessage, fieldoffset);

        fieldoffset += gasInfo.length;
        let storageInfo = TezosMessageUtils.findInt(delegationMessage, fieldoffset);

        fieldoffset += storageInfo.length;
        let hasDelegate = TezosMessageUtils.readBoolean(delegationMessage.substring(fieldoffset, fieldoffset + 2));

        fieldoffset += 2;
        let delegate = '';
        if (hasDelegate) {
            delegate = TezosMessageUtils.readAddress(delegationMessage.substring(fieldoffset, fieldoffset + 42));
            fieldoffset += 42;
        }

        let next;
        if (delegationMessage.length > fieldoffset) {
            next = getOperationType(delegationMessage.substring(fieldoffset, fieldoffset + 2));
        }

        const delegation: Operation = {
            kind: "delegation",
            source: source,
            delegate: hasDelegate ? delegate : undefined,
            fee: feeInfo.value + "",
            gas_limit: gasInfo.value + "",
            storage_limit: storageInfo.value + "",
            counter: counterInfo.value + ""
        };

        const envelope: OperationEnvelope = {
            operation: delegation,
            branch: branch,
            next: next,
            nextoffset: next ? fieldoffset : -1
        }

        return envelope;
    }

    /**
     * "Forges" Tezos P2P Delegation message. Note that to be sent to the node it will need to be added to an operation group or be prepended with a Branch.
     * 
     * @param delegation Message to encode
     */
    export function encodeDelegation(delegation: Delegation): string {
        if (delegation.kind !== 'delegation') { throw new Error('Incorrect operation type'); }

        let hex = TezosMessageUtils.writeInt(sepyTnoitarepo['delegation']);
        hex += TezosMessageUtils.writeAddress(delegation.source).slice(2);
        hex += TezosMessageUtils.writeInt(parseInt(delegation.fee));
        hex += TezosMessageUtils.writeInt(parseInt(delegation.counter));
        hex += TezosMessageUtils.writeInt(parseInt(delegation.gas_limit));
        hex += TezosMessageUtils.writeInt(parseInt(delegation.storage_limit));

        if (delegation.delegate !== undefined && delegation.delegate !== '') {
            hex += TezosMessageUtils.writeBoolean(true);
            hex += TezosMessageUtils.writeAddress(delegation.delegate).slice(2);
        } else {
            hex += TezosMessageUtils.writeBoolean(false);
        }

        return hex;
    }

    /**
     * Parse an operation group.
     * 
     * @param {string} hex Encoded message stream
     */
    export function parseOperationGroup(hex: string): Array<any> {
        let operations = [];
        let envelope = parseOperation(hex, idFirstOperation(hex));
        //@ts-ignore
        operations.push(envelope.operation);
        let groupOffset = 0;
        while (envelope.next) {
            groupOffset += envelope.nextoffset;
            envelope = parseOperation(hex.substring(groupOffset), envelope.next, false);
            //@ts-ignore
            operations.push(envelope.operation);
        }

        return operations;
    }

    interface OperationEnvelope {
        operation: any,
        branch: string,
        next?: string,
        nextoffset: number
    }
}

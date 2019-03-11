import { TezosMessageUtils } from "./TezosMessageUtil";
import { Activation, Ballot, BallotVote, Operation} from "../../types/tezos/TezosChainTypes";

const operationTypes: Array<string> = [
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

export namespace TezosMessageCodec {
  /**
   * Parse operation type from a bounded hex string and translate to enum.
   * @param {string} hex 
   */
  export function getOperationType(hex: string) {
    return operationTypes[TezosMessageUtils.readInt(hex)];
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
      if (operation.kind === 'reveal') { return encodeReveal(operation); }
      if (operation.kind === 'transaction') { return encodeTransaction(operation); }
      if (operation.kind === 'origination') { return encodeOrigination(operation); }
      if (operation.kind === 'delegation') { return encodeDelegation(operation); }
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
    let hex = TezosMessageUtils.writeInt(operationTypes.indexOf('accountActivation'));
    hex += TezosMessageUtils.writeAddress(activation.pkh).slice(4);
    hex += activation.secret;

    return hex;
  }

  /**
   * Parse a Ballot, tag 6, message possibly containing siblings.
   * 
   * @param {string} revealMessage Encoded ballot message
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
    let hex = TezosMessageUtils.writeInt(operationTypes.indexOf('ballot'));
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

    let source = TezosMessageUtils.readAddress(revealMessage.substring(fieldoffset, fieldoffset + 44));
    fieldoffset += 44;

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
  export function encodeReveal(reveal: Operation): string {
    if (reveal.kind !== 'reveal') { throw new Error('Incorrect operation type.'); }
    if (reveal.public_key === undefined) { throw new Error('Missing public key.'); }

    let hex = TezosMessageUtils.writeInt(operationTypes.indexOf('reveal'));
    hex += TezosMessageUtils.writeAddress(reveal.source);
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

    let source = TezosMessageUtils.readAddress(transactionMessage.substring(fieldoffset, fieldoffset + 44));
    fieldoffset += 44;

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
    let parameters = '';
    if (hasParameters) {
      // TODO
    }

    let next;
    if (transactionMessage.length > fieldoffset) {
      next = getOperationType(transactionMessage.substring(fieldoffset, fieldoffset + 2));
    }

    const transaction: Operation = {
      kind: "transaction",
      source: source,
      destination: target,
      amount: amountInfo.value + "",
      fee: feeInfo.value + "",
      gas_limit: gasInfo.value + "",
      storage_limit: storageInfo.value + "",
      counter: counterInfo.value + ""
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
   * @param {Operation} transaction 
   * @returns {string}
   * 
   * @todo parameters field is not yet supported
   * @see {@link https://tezos.gitlab.io/mainnet/api/p2p.html#transaction-tag-8|Tezos P2P message format}
   */
  export function encodeTransaction(transaction: Operation): string {
    if (transaction.kind !== 'transaction') { throw new Error('Incorrect operation type'); }
    if (transaction.amount === undefined) { throw new Error('Missing amount'); }
    if (transaction.destination === undefined) { throw new Error('Missing destination'); }

    let hex = TezosMessageUtils.writeInt(operationTypes.indexOf('transaction'));
    hex += TezosMessageUtils.writeAddress(transaction.source);
    hex += TezosMessageUtils.writeInt(parseInt(transaction.fee));
    hex += TezosMessageUtils.writeInt(parseInt(transaction.counter));
    hex += TezosMessageUtils.writeInt(parseInt(transaction.gas_limit));
    hex += TezosMessageUtils.writeInt(parseInt(transaction.storage_limit));
    hex += TezosMessageUtils.writeInt(parseInt(transaction.amount));
    hex += TezosMessageUtils.writeAddress(transaction.destination);
    hex += '00'; // no parameters

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

    let source = TezosMessageUtils.readAddress(originationMessage.substring(fieldoffset, fieldoffset + 44));
    fieldoffset += 44;

    let feeInfo = TezosMessageUtils.findInt(originationMessage, fieldoffset);

    fieldoffset += feeInfo.length;
    let counterInfo = TezosMessageUtils.findInt(originationMessage, fieldoffset);

    fieldoffset += counterInfo.length;
    let gasInfo = TezosMessageUtils.findInt(originationMessage, fieldoffset);

    fieldoffset += gasInfo.length;
    let storageInfo = TezosMessageUtils.findInt(originationMessage, fieldoffset);
    fieldoffset += storageInfo.length;

    let publickeyhash = TezosMessageUtils.readAddress(originationMessage.substring(fieldoffset, fieldoffset + 42));
    fieldoffset += 42;

    let balanceInfo = TezosMessageUtils.findInt(originationMessage, fieldoffset);

    fieldoffset += balanceInfo.length;
    let spendable = TezosMessageUtils.readBoolean(originationMessage.substring(fieldoffset, fieldoffset + 2));

    fieldoffset += 2;
    let delegatable = TezosMessageUtils.readBoolean(originationMessage.substring(fieldoffset, fieldoffset + 2));

    fieldoffset += 2;
    let hasDelegate = TezosMessageUtils.readBoolean(originationMessage.substring(fieldoffset, fieldoffset + 2));

    fieldoffset += 2;
    let delegate = '';
    if (hasDelegate) {
      delegate = TezosMessageUtils.readAddress(originationMessage.substring(fieldoffset, fieldoffset + 42));
      fieldoffset += 42;
    }

    let hasScript = TezosMessageUtils.readBoolean(originationMessage.substring(fieldoffset, fieldoffset + 2));

    fieldoffset += 2;
    if (hasScript) {
      // TODO
    } else {
      throw new Error('');
    }

    let next; // TODO
    if (originationMessage.length > fieldoffset && !hasScript) {
      next = getOperationType(originationMessage.substring(fieldoffset, fieldoffset + 2));
    }

    const origination: Operation = {
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

    const envelope: OperationEnvelope = {
      operation: origination,
      branch: branch,
      next: next,
      nextoffset: next ? fieldoffset : -1
    }

    return envelope;
  }

  /**
   * "Forges" Tezos P2P Origination message. Note that to be sent to the node it will need to be added to an operation group or be prepended with a Branch.
   * 
   * @param origination Message to encode
   */
  export function encodeOrigination(origination: Operation): string {
    if (origination.kind !== 'origination') { throw new Error('Incorrect operation type'); }
    if (origination.managerPubkey === undefined) { throw new Error('Missing manager address'); }
    if (origination.balance === undefined) { throw new Error('Missing balance'); }

    let hex = TezosMessageUtils.writeInt(operationTypes.indexOf('origination'));
    hex += TezosMessageUtils.writeAddress(origination.source);
    hex += TezosMessageUtils.writeInt(parseInt(origination.fee));
    hex += TezosMessageUtils.writeInt(parseInt(origination.counter));
    hex += TezosMessageUtils.writeInt(parseInt(origination.gas_limit));
    hex += TezosMessageUtils.writeInt(parseInt(origination.storage_limit));
    hex += TezosMessageUtils.writeAddress(origination.managerPubkey).slice(2);
    hex += TezosMessageUtils.writeInt(parseInt(origination.balance));
    hex += origination.spendable !== undefined ? TezosMessageUtils.writeBoolean(origination.spendable) : '00';
    hex += origination.delegatable !== undefined ? TezosMessageUtils.writeBoolean(origination.delegatable) : '00';

    if (origination.delegate !== undefined) {
      hex += TezosMessageUtils.writeBoolean(true);
      hex += TezosMessageUtils.writeAddress(origination.delegate).slice(2);
    } else {
      hex += TezosMessageUtils.writeBoolean(false);
    }
    hex += '00'; // no script

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

    let source = TezosMessageUtils.readAddress(delegationMessage.substring(fieldoffset, fieldoffset + 44));
    fieldoffset += 44;

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
  export function encodeDelegation(delegation: Operation): string {
    if (delegation.kind !== 'delegation') { throw new Error('Incorrect operation type'); }

    let hex = TezosMessageUtils.writeInt(operationTypes.indexOf('delegation'));
    hex += TezosMessageUtils.writeAddress(delegation.source);
    hex += TezosMessageUtils.writeInt(parseInt(delegation.fee));
    hex += TezosMessageUtils.writeInt(parseInt(delegation.counter));
    hex += TezosMessageUtils.writeInt(parseInt(delegation.gas_limit));
    hex += TezosMessageUtils.writeInt(parseInt(delegation.storage_limit));

    if (delegation.delegate !== undefined) {
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
  export function parseOperationGroup(hex: string): Array<Operation> {
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

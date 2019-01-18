import { TezosMessageUtils } from "./TezosMessageUtil";
import { Operation } from "./TezosTypes";

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
   * @param {string} hex Encoded message.
   * @param {string} opType Operation type to parse.
   * @param {boolean} isFirst Flag to indicate first operation of Operation Group.
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

  /**
   * Parse a reveal message possibly containing siblings.
   * @param {string} revealMessage Encoded reveal-type message
   * @param {boolean} isFirst Flag to indicate first operation of Operation Group.
   */
  export function parseReveal(revealMessage: string, isFirst: boolean = true): OperationEnvelope {
    let hexOperationType = isFirst ? revealMessage.substring(64, 66) : revealMessage.substring(0, 2);
    if (getOperationType(hexOperationType) !== "reveal") {
      throw new Error("Provided operation is not a reveal.");
    }

    let fieldoffset = 0;
    let branch = "";
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
   * Creates a hex string for the provided reveal operation.
   * @param {string} reveal A reveal operation to be encoded.
   */
  export function encodeReveal(reveal: Operation): string {
    if (reveal.kind !== "reveal") {throw new Error("Incorrect operation type."); }
    if (reveal.public_key === undefined) {throw new Error("Missing public key."); }

    let hex = TezosMessageUtils.writeInt(operationTypes.indexOf("reveal"));
    hex += TezosMessageUtils.writeAddress(reveal.source);
    hex += TezosMessageUtils.writeInt(parseInt(reveal.fee));
    hex += TezosMessageUtils.writeInt(parseInt(reveal.counter));
    hex += TezosMessageUtils.writeInt(parseInt(reveal.gas_limit));
    hex += TezosMessageUtils.writeInt(parseInt(reveal.storage_limit));
    hex += TezosMessageUtils.writePublicKey(reveal.public_key);

    return hex;
  }

  /**
   * Parse a transaction message possibly containing siblings.
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
   * Parse an origination message possibly containing siblings.
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
    }

    let next; // TODO
    //if (originationMessage.length > fieldoffset) {
    //  next = getOperationType(originationMessage.substring(fieldoffset, fieldoffset + 2));
    //}

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
   * Parse an delegation message possibly containing siblings.
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
   * Parse an operation group
   * @param {string} hex Encoded message stream.
   */
  export function parseOperationGroup(hex: string): Array<Operation> {
    let operations = [];
    let envelope = parseOperation(hex, idFirstOperation(hex));
    //@ts-ignore
    operations.push(envelope.operation);
    while (envelope.next) {
      envelope = parseOperation(hex.substring(envelope.nextoffset), envelope.next, false);
      //@ts-ignore
      operations.push(envelope.operation);
    }

    return operations;
  }

  interface OperationEnvelope {
    operation: Operation,
    branch: string,
    next?: string,
    nextoffset: number
  }
}

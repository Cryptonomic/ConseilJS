import { TezosMessageUtils } from "./TezosMessageUtil";
import { Operation } from "./TezosTypes";

const operationTypes: Array<string> = [
  "endorsement",
  "seedNonceRevelation",
  "doubleEndorsementEvidence",
  "doubleBakingEvidence",
  "accountActivate",
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
      case "accountActivate":
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
        throw new Error(`Unsupported operation type: ${opType}`);
      case "delegation":
        throw new Error(`Unsupported operation type: ${opType}`);
      default:
        throw new Error(`Unsupported operation type: ${opType}`);
    }
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
    let branch = TezosMessageUtils.readBranch(transactionMessage.substring(fieldoffset, fieldoffset + 64));

    fieldoffset += 64 + 2; // branch + type
    let source = "";
    if (transactionMessage.substring(fieldoffset, fieldoffset + 4) === "0000") {
      fieldoffset += 4;
      source = TezosMessageUtils.readAddress(transactionMessage.substring(fieldoffset, fieldoffset + 40));
    } else {
      fieldoffset += 2;
      source = TezosMessageUtils.readAddress(transactionMessage.substring(fieldoffset, fieldoffset + 40), 'kt1');
      fieldoffset += 2;
    }

    fieldoffset += 40;
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
    let target = "";
    if (transactionMessage.substring(fieldoffset, fieldoffset + 4) === "0000") {
      fieldoffset += 4;
      target = TezosMessageUtils.readAddress(transactionMessage.substring(fieldoffset, fieldoffset + 40));
      fieldoffset += 40 + 2;
    } else if (transactionMessage.substring(fieldoffset, fieldoffset + 2) === "01"){
      fieldoffset += 2;
      target = TezosMessageUtils.readAddress(transactionMessage.substring(fieldoffset, fieldoffset + 40), 'kt1');
      fieldoffset += 40 + 4;
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
   * Parse a reveal message possibly containing siblings.
   * @param {string} revealMessage Encoded reveal-type message
   * @param {boolean} isFirst Flag to indicate first operation of Operation Group.
   */
  export function parseReveal(revealMessage, isFirst = true): OperationEnvelope {
    let hexOperationType = isFirst ? revealMessage.substring(64, 66) : revealMessage.substring(0, 2);
    if (getOperationType(hexOperationType) !== "reveal") {
      throw new Error("Provided operation is not a reveal.");
    }

    let fieldoffset = 0;
    let branch = TezosMessageUtils.readBranch(
      revealMessage.substring(fieldoffset, fieldoffset + 64)
    );

    fieldoffset += 64 + 2; // branch + type

    let source = "";
    if (revealMessage.substring(fieldoffset, fieldoffset + 4) === "0000") {
      fieldoffset += 4;
      source = TezosMessageUtils.readAddress(revealMessage.substring(fieldoffset, fieldoffset + 40));
    } else {
      fieldoffset += 2;
      source = TezosMessageUtils.readAddress(revealMessage.substring(fieldoffset, fieldoffset + 40), 'kt1');
      fieldoffset += 2;
    }

    fieldoffset += 40;
    let feeInfo = TezosMessageUtils.findInt(revealMessage, fieldoffset);

    fieldoffset += feeInfo.length;
    let counterInfo = TezosMessageUtils.findInt(revealMessage, fieldoffset);

    fieldoffset += counterInfo.length;
    let gasInfo = TezosMessageUtils.findInt(revealMessage, fieldoffset);

    fieldoffset += gasInfo.length;
    let storageInfo = TezosMessageUtils.findInt(revealMessage, fieldoffset);
    fieldoffset += storageInfo.length;

    fieldoffset += 2; // ??
    let publickey = TezosMessageUtils.readKey(revealMessage.substring(fieldoffset, fieldoffset + 64));
    fieldoffset += 64;

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

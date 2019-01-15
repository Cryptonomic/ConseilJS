import { TezosMessageUtils } from "./TezosMessageUtil";

const operationTypes = [
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
  export function getOperationType(hex) {
    return operationTypes[TezosMessageUtils.readInt(hex)];
  }

  export function idFirstOperation(hex) {
    return getOperationType(hex.substring(64, 66));
  }

  export function parseOperation(hex, opType, isFirst = true) {
    switch (opType) {
      case "endorsement":
        return null;
      case "seedNonceRevelation":
        return null;
      case "doubleEndorsementEvidence":
        return null;
      case "doubleBakingEvidence":
        return null;
      case "accountActivate":
        return null;
      case "proposal":
        return null;
      case "ballot":
        return null;
      case "reveal":
        return parseReveal(hex, isFirst);
      case "transaction":
        return parseTransaction(hex, isFirst);
      case "origination":
        return null;
      case "delegation":
        return null;
    }
  }

  export function parseTransaction(transactionMessage, isFirst = true) {
    let hexOperationType = isFirst
      ? transactionMessage.substring(64, 66)
      : transactionMessage.substring(0, 2);
    if (getOperationType(hexOperationType) !== "transaction") {
      throw new Error("Provided operation is not a transaction.");
    }

    let fieldoffset = 0;
    let branch = TezosMessageUtils.readBranch(
      transactionMessage.substring(fieldoffset, fieldoffset + 64)
    );

    fieldoffset += 64 + 2; // branch + type
    let source = "";
    if (transactionMessage.substring(fieldoffset, fieldoffset + 4) === "0000") {
      fieldoffset += 4;
      source = TezosMessageUtils.readAddress(
        transactionMessage.substring(fieldoffset, fieldoffset + 40)
      );
    } else {
      //KT1
    }

    fieldoffset += 40;
    let feeInfo = TezosMessageUtils.findInt(transactionMessage, fieldoffset);

    fieldoffset += feeInfo.length;
    let counterInfo = TezosMessageUtils.findInt(
      transactionMessage,
      fieldoffset
    );

    fieldoffset += counterInfo.length;
    let gasInfo = TezosMessageUtils.findInt(transactionMessage, fieldoffset);

    fieldoffset += gasInfo.length;
    let storageInfo = TezosMessageUtils.findInt(
      transactionMessage,
      fieldoffset
    );

    fieldoffset += storageInfo.length;
    let amountInfo = TezosMessageUtils.findInt(transactionMessage, fieldoffset);

    fieldoffset += amountInfo.length;
    let target = "";
    if (transactionMessage.substring(fieldoffset, fieldoffset + 4) === "0000") {
      fieldoffset += 4;
      target = TezosMessageUtils.readAddress(
        transactionMessage.substring(fieldoffset, fieldoffset + 40)
      );
      fieldoffset += 40 + 2;
    } else {
      //KT1
      fieldoffset += 40 + 4;
    }

    let next;
    if (transactionMessage.length > fieldoffset) {
      next = getOperationType(
        transactionMessage.substring(fieldoffset, fieldoffset + 2)
      );
    }

    return {
      branch: branch,
      type: "transaction",
      source: source,
      target: target,
      amount: amountInfo.value,
      fee: feeInfo.value,
      gas: gasInfo.value,
      storage: storageInfo.value,
      counter: counterInfo.value,
      next: next,
      nextoffset: next ? fieldoffset : -1
    };
  }

  export function parseReveal(revealMessage, isFirst = true) {
    let hexOperationType = isFirst
      ? revealMessage.substring(64, 66)
      : revealMessage.substring(0, 2);
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
      source = TezosMessageUtils.readAddress(
        revealMessage.substring(fieldoffset, fieldoffset + 40)
      );
    } else {
      //KT1
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
    let publickey = TezosMessageUtils.readBranch(
      revealMessage.substring(fieldoffset, fieldoffset + 64)
    );
    fieldoffset += 64;

    let next;
    if (revealMessage.length > fieldoffset) {
      next = getOperationType(
        revealMessage.substring(fieldoffset, fieldoffset + 2)
      );
    }

    return {
      branch: branch,
      type: "reveal",
      source: source,
      publickey: publickey,
      fee: feeInfo.value,
      gas: gasInfo.value,
      storage: storageInfo.value,
      counter: counterInfo.value,
      next: next,
      nextoffset: next ? fieldoffset : -1
    };
  }

  export function parseOperationGroup(hex) {
    let operations = [];
    let op = parseOperation(hex, idFirstOperation(hex));
    //@ts-ignore
    operations.push(op);
    //@ts-ignore
    while (op["next"]) {
      //@ts-ignore
      op = parseOperation(hex.substring(op["nextoffset"]), op["next"], false);
      //@ts-ignore
      operations.push(op);
    }

    return operations;
  }
}

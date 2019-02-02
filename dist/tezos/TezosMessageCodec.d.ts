import { Operation } from "../types/tezos/TezosChainTypes";
export declare namespace TezosMessageCodec {
    function getOperationType(hex: string): string;
    function idFirstOperation(hex: string): string;
    function parseOperation(hex: string, opType: string, isFirst?: boolean): OperationEnvelope;
    function parseReveal(revealMessage: string, isFirst?: boolean): OperationEnvelope;
    function encodeReveal(reveal: Operation): string;
    function parseTransaction(transactionMessage: string, isFirst?: boolean): OperationEnvelope;
    function parseOrigination(originationMessage: string, isFirst?: boolean): OperationEnvelope;
    function parseDelegation(delegationMessage: string, isFirst?: boolean): OperationEnvelope;
    function parseOperationGroup(hex: string): Array<Operation>;
    interface OperationEnvelope {
        operation: Operation;
        branch: string;
        next?: string;
        nextoffset: number;
    }
}

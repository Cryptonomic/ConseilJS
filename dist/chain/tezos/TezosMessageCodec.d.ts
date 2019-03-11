import { Activation, Ballot, Operation } from "../../types/tezos/TezosChainTypes";
export declare namespace TezosMessageCodec {
    function getOperationType(hex: string): string;
    function idFirstOperation(hex: string): string;
    function parseOperation(hex: string, opType: string, isFirst?: boolean): OperationEnvelope;
    function encodeOperation(message: any): string;
    function encodeActivation(activation: Activation): string;
    function parseBallot(ballotMessage: string, isFirst?: boolean): OperationEnvelope;
    function encodeBallot(ballot: Ballot): string;
    function parseReveal(revealMessage: string, isFirst?: boolean): OperationEnvelope;
    function encodeReveal(reveal: Operation): string;
    function parseTransaction(transactionMessage: string, isFirst?: boolean): OperationEnvelope;
    function encodeTransaction(transaction: Operation): string;
    function parseOrigination(originationMessage: string, isFirst?: boolean): OperationEnvelope;
    function encodeOrigination(origination: Operation): string;
    function parseDelegation(delegationMessage: string, isFirst?: boolean): OperationEnvelope;
    function encodeDelegation(delegation: Operation): string;
    function parseOperationGroup(hex: string): Array<any>;
    interface OperationEnvelope {
        operation: any;
        branch: string;
        next?: string;
        nextoffset: number;
    }
}

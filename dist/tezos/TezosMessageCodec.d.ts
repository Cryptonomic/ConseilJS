import { Operation } from "./TezosTypes";
export declare namespace TezosMessageCodec {
    /**
     * Parse operation type from a bounded hex string and translate to enum.
     * @param {string} hex
     */
    function getOperationType(hex: string): string;
    /**
     * Get OperationType of the first operation in the OperationGroup.
     * @param {string} hex Forged message in hex format.
     */
    function idFirstOperation(hex: string): string;
    /**
     * Parse an operation of unknown length, possibly containing siblings.
     * @param {string} hex Encoded message.
     * @param {string} opType Operation type to parse.
     * @param {boolean} isFirst Flag to indicate first operation of Operation Group.
     */
    function parseOperation(hex: string, opType: string, isFirst?: boolean): OperationEnvelope;
    /**
     * Parse a reveal message possibly containing siblings.
     * @param {string} revealMessage Encoded reveal-type message
     * @param {boolean} isFirst Flag to indicate first operation of Operation Group.
     */
    function parseReveal(revealMessage: string, isFirst?: boolean): OperationEnvelope;
    /**
     * Parse a transaction message possibly containing siblings.
     * @param {string} transactionMessage Encoded transaction-type message
     * @param {boolean} isFirst Flag to indicate first operation of Operation Group.
     */
    function parseTransaction(transactionMessage: string, isFirst?: boolean): OperationEnvelope;
    /**
     * Parse an origination message possibly containing siblings.
     * @param {string} originationMessage Encoded origination-type message
     * @param {boolean} isFirst Flag to indicate first operation of Operation Group.
     */
    function parseOrigination(originationMessage: string, isFirst?: boolean): OperationEnvelope;
    /**
     * Parse an delegation message possibly containing siblings.
     * @param {string} delegationMessage Encoded delegation-type message
     * @param {boolean} isFirst Flag to indicate first operation of Operation Group.
     */
    function parseDelegation(delegationMessage: string, isFirst?: boolean): OperationEnvelope;
    /**
     * Parse an operation group
     * @param {string} hex Encoded message stream.
     */
    function parseOperationGroup(hex: string): Array<Operation>;
    interface OperationEnvelope {
        operation: Operation;
        branch: string;
        next?: string;
        nextoffset: number;
    }
}

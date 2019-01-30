/// <reference types="node" />
import { KeyStore } from "../types/KeyStore";
import * as TezosTypes from "./TezosTypes";
export interface SignedOperationGroup {
    bytes: Buffer;
    signature: string;
}
export interface OperationResult {
    results: TezosTypes.AlphaOperationsWithMetadata;
    operationGroupID: string;
}
export declare namespace TezosOperations {
    function signOperationGroup(forgedOperation: string, keyStore: KeyStore, derivationPath: string): Promise<SignedOperationGroup>;
    function computeOperationHash(signedOpGroup: SignedOperationGroup): string;
    function forgeOperations(network: string, blockHead: TezosTypes.BlockMetadata, operations: object[]): Promise<string>;
    function applyOperation(network: string, blockHead: TezosTypes.BlockMetadata, operations: object[], operationGroupHash: string, forgedOperationGroup: string, signedOpGroup: SignedOperationGroup): Promise<TezosTypes.AlphaOperationsWithMetadata[]>;
    function injectOperation(network: string, signedOpGroup: SignedOperationGroup): Promise<string>;
    function sendOperation(network: string, operations: object[], keyStore: KeyStore, derivationPath: any): Promise<OperationResult>;
    function appendRevealOperation(network: string, keyStore: KeyStore, account: TezosTypes.Account, operations: TezosTypes.Operation[]): Promise<TezosTypes.Operation[]>;
    function sendTransactionOperation(network: string, keyStore: KeyStore, to: string, amount: number, fee: number, derivationPath: string): Promise<OperationResult>;
    function sendDelegationOperation(network: string, keyStore: KeyStore, delegate: string, fee: number, derivationPath: string): Promise<OperationResult>;
    function sendOriginationOperation(network: string, keyStore: KeyStore, amount: number, delegate: string, spendable: boolean, delegatable: boolean, fee: number, derivationPath: string): Promise<OperationResult>;
    function isImplicitAndEmpty(network: string, accountHash: string): Promise<boolean>;
    function isManagerKeyRevealedForAccount(network: string, keyStore: KeyStore): Promise<boolean>;
    function sendKeyRevealOperation(network: string, keyStore: KeyStore, fee: number, derivationPath: string): Promise<OperationResult>;
    function sendIdentityActivationOperation(network: string, keyStore: KeyStore, activationCode: string, derivationPath: string): Promise<OperationResult>;
}

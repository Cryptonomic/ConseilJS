import { KeyStore } from "../types/KeyStore";
import * as TezosTypes from "./TezosTypes";
export declare namespace TezosOperations {
    function signOperationGroup(forgedOperation: string, keyStore: KeyStore, derivationPath: string): Promise<TezosTypes.SignedOperationGroup>;
    function computeOperationHash(signedOpGroup: TezosTypes.SignedOperationGroup): string;
    function forgeOperations(network: string, blockHead: TezosTypes.BlockMetadata, operations: object[]): Promise<string>;
    function applyOperation(network: string, blockHead: TezosTypes.BlockMetadata, operations: object[], operationGroupHash: string, forgedOperationGroup: string, signedOpGroup: TezosTypes.SignedOperationGroup): Promise<TezosTypes.AlphaOperationsWithMetadata[]>;
    function injectOperation(network: string, signedOpGroup: TezosTypes.SignedOperationGroup): Promise<string>;
    function sendOperation(network: string, operations: object[], keyStore: KeyStore, derivationPath: any): Promise<TezosTypes.OperationResult>;
    function appendRevealOperation(network: string, keyStore: KeyStore, account: TezosTypes.Account, operations: TezosTypes.Operation[]): Promise<TezosTypes.Operation[]>;
    function sendTransactionOperation(network: string, keyStore: KeyStore, to: string, amount: number, fee: number, derivationPath: string): Promise<TezosTypes.OperationResult>;
    function sendDelegationOperation(network: string, keyStore: KeyStore, delegate: string, fee: number, derivationPath: string): Promise<TezosTypes.OperationResult>;
    function sendAccountOriginationOperation(network: string, keyStore: KeyStore, amount: number, delegate: string, spendable: boolean, delegatable: boolean, fee: number, derivationPath: string): Promise<TezosTypes.OperationResult>;
    function sendContractOriginationOperation(network: string, keyStore: KeyStore, amount: number, delegate: string, spendable: boolean, delegatable: boolean, fee: number, derivationPath: string, storage_limit: string, gas_limit: string, code: Array<object>, storage: object): Promise<TezosTypes.OperationResult>;
    function sendContractInvocationOperation(network: string, keyStore: KeyStore, to: string, amount: number, fee: number, derivationPath: string, storage_limit: string, gas_limit: string, parameters: object): Promise<TezosTypes.OperationResult>;
    function isImplicitAndEmpty(network: string, accountHash: string): Promise<boolean>;
    function isManagerKeyRevealedForAccount(network: string, keyStore: KeyStore): Promise<boolean>;
    function sendKeyRevealOperation(network: string, keyStore: KeyStore, fee: number, derivationPath: string): Promise<TezosTypes.OperationResult>;
    function sendIdentityActivationOperation(network: string, keyStore: KeyStore, activationCode: string, derivationPath: string): Promise<TezosTypes.OperationResult>;
}

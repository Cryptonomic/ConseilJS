import { KeyStore } from '../../types/wallet/KeyStore';
import * as TezosTypes from '../../types/tezos/TezosChainTypes';
export declare namespace TezosNodeWriter {
    function signOperationGroup(forgedOperation: string, keyStore: KeyStore, derivationPath: string): Promise<TezosTypes.SignedOperationGroup>;
    function forgeOperations(blockHead: TezosTypes.BlockMetadata, operations: object[]): string;
    function forgeOperationsRemotely(server: string, blockHead: TezosTypes.BlockMetadata, operations: object[]): Promise<string>;
    function applyOperation(server: string, blockHead: TezosTypes.BlockMetadata, operations: object[], signedOpGroup: TezosTypes.SignedOperationGroup): Promise<TezosTypes.AlphaOperationsWithMetadata[]>;
    function injectOperation(server: string, signedOpGroup: TezosTypes.SignedOperationGroup): Promise<string>;
    function sendOperation(server: string, operations: object[], keyStore: KeyStore, derivationPath: any): Promise<TezosTypes.OperationResult>;
    function appendRevealOperation(server: string, keyStore: KeyStore, accountHash: string, accountOperationIndex: number, operations: TezosTypes.Operation[]): Promise<TezosTypes.Operation[]>;
    function sendTransactionOperation(server: string, keyStore: KeyStore, to: string, amount: number, fee: number, derivationPath: string): Promise<TezosTypes.OperationResult>;
    function sendDelegationOperation(server: string, keyStore: KeyStore, delegator: string, delegate: string | undefined, fee?: number, derivationPath?: string): Promise<TezosTypes.OperationResult>;
    function sendUndelegationOperation(server: string, keyStore: KeyStore, delegator: string, delegate: string, fee?: number, derivationPath?: string): Promise<TezosTypes.OperationResult>;
    function sendAccountOriginationOperation(server: string, keyStore: KeyStore, amount: number, delegate: string | undefined, spendable: boolean, delegatable: boolean, fee?: number, derivationPath?: string): Promise<TezosTypes.OperationResult>;
    function sendContractOriginationOperation(server: string, keyStore: KeyStore, amount: number, delegate: string | undefined, spendable: boolean, delegatable: boolean, fee: number, derivationPath: string, storage_limit: string, gas_limit: string, code: string, storage: string): Promise<TezosTypes.OperationResult>;
    function sendContractInvocationOperation(server: string, keyStore: KeyStore, to: string, amount: number, fee: number, derivationPath: string, storageLimit: number, gasLimit: number, parameters?: string): Promise<TezosTypes.OperationResult>;
    function sendKeyRevealOperation(server: string, keyStore: KeyStore, fee?: number, derivationPath?: string): Promise<TezosTypes.OperationResult>;
    function sendIdentityActivationOperation(server: string, keyStore: KeyStore, activationCode: string, derivationPath: string): Promise<TezosTypes.OperationResult>;
}

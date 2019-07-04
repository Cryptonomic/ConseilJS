import { KeyStore } from '../../types/wallet/KeyStore';
import * as TezosTypes from '../../types/tezos/TezosChainTypes';
import * as TezosP2PMessageTypes from '../../types/tezos/TezosP2PMessageTypes';
import * as TezosRPCTypes from '../../types/tezos/TezosRPCResponseTypes';
export declare namespace TezosNodeWriter {
    function signOperationGroup(forgedOperation: string, keyStore: KeyStore, derivationPath: string): Promise<TezosTypes.SignedOperationGroup>;
    function forgeOperations(branch: string, operations: TezosP2PMessageTypes.Operation[]): string;
    function forgeOperationsRemotely(server: string, blockHead: TezosRPCTypes.TezosBlock, operations: TezosP2PMessageTypes.Operation[]): Promise<string>;
    function applyOperation(server: string, branch: string, protocol: string, operations: TezosP2PMessageTypes.Operation[], signedOpGroup: TezosTypes.SignedOperationGroup): Promise<TezosTypes.AlphaOperationsWithMetadata[]>;
    function injectOperation(server: string, signedOpGroup: TezosTypes.SignedOperationGroup): Promise<string>;
    function sendOperation(server: string, operations: TezosP2PMessageTypes.Operation[], keyStore: KeyStore, derivationPath: any): Promise<TezosTypes.OperationResult>;
    function appendRevealOperation(server: string, keyStore: KeyStore, accountHash: string, accountOperationIndex: number, operations: TezosP2PMessageTypes.StackableOperation[]): Promise<(TezosP2PMessageTypes.Transaction | TezosP2PMessageTypes.Delegation | TezosP2PMessageTypes.Reveal)[]>;
    function sendTransactionOperation(server: string, keyStore: KeyStore, to: string, amount: number, fee: number, derivationPath?: string): Promise<TezosTypes.OperationResult>;
    function sendDelegationOperation(server: string, keyStore: KeyStore, delegator: string, delegate: string | undefined, fee?: number, derivationPath?: string): Promise<TezosTypes.OperationResult>;
    function sendUndelegationOperation(server: string, keyStore: KeyStore, delegator: string, fee?: number, derivationPath?: string): Promise<TezosTypes.OperationResult>;
    function sendAccountOriginationOperation(server: string, keyStore: KeyStore, amount: number, delegate: string | undefined, spendable: boolean, delegatable: boolean, fee?: number, derivationPath?: string): Promise<TezosTypes.OperationResult>;
    function sendContractOriginationOperation(server: string, keyStore: KeyStore, amount: number, delegate: string | undefined, spendable: boolean, delegatable: boolean, fee: number, derivationPath: string, storage_limit: number, gas_limit: number, code: string, storage: string, codeFormat?: TezosTypes.TezosParameterFormat): Promise<TezosTypes.OperationResult>;
    function sendContractInvocationOperation(server: string, keyStore: KeyStore, to: string, amount: number, fee: number, derivationPath: string, storageLimit: number, gasLimit: number, parameters?: string, parameterFormat?: TezosTypes.TezosParameterFormat): Promise<TezosTypes.OperationResult>;
    function sendContractPing(server: string, keyStore: KeyStore, to: string, fee: number, derivationPath: string, storageLimit: number, gasLimit: number): Promise<TezosTypes.OperationResult>;
    function sendKeyRevealOperation(server: string, keyStore: KeyStore, fee?: number, derivationPath?: string): Promise<TezosTypes.OperationResult>;
    function sendIdentityActivationOperation(server: string, keyStore: KeyStore, activationCode: string, derivationPath: string): Promise<TezosTypes.OperationResult>;
}

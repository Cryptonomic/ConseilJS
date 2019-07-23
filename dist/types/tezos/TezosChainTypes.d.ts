/// <reference types="node" />
export interface AlphaOperationResult {
    status: string;
    originated_contracts: string[];
    errors: string[];
}
export interface AlphaOperationContentsAndResult {
    kind: string;
    metadata: AlphaOperationResult;
}
export interface AlphaOperationsWithMetadata {
    contents: AlphaOperationContentsAndResult[];
    signature: string;
    kind: string;
    id: string;
    contract: string;
}
export interface InjectedOperation {
    injectedOperation: string;
}
export interface SignedOperationGroup {
    bytes: Buffer;
    signature: string;
}
export interface OperationResult {
    results: AlphaOperationsWithMetadata;
    operationGroupID: string;
}
export declare enum OperationKindType {
    SeedNonceRevelation = "seed_nonce_revelation",
    Delegation = "delegation",
    Transaction = "transaction",
    AccountActivation = "activate_account",
    Origination = "origination",
    Reveal = "reveal",
    Endorsement = "endorsement",
    Ballot = "ballot"
}
export declare enum TezosParameterFormat {
    Michelson = "michelson",
    Micheline = "micheline"
}

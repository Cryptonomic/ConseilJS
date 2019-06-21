/// <reference types="node" />
export interface BlockHeader {
    level: number;
    proto: number;
    predecessor: string;
    timestamp: string;
    validation_pass: number;
    operations_hash: string;
    fitness: string[];
    context: string;
    priority: number;
    proof_of_work_nonce: string;
    signature: string;
}
export interface BlockMetadata {
    protocol: string;
    chain_id: string;
    hash: string;
    metadata: BlockHeader;
}
export interface AccountDelegate {
    setable: boolean;
    value: string;
}
export interface Account {
    manager: string;
    balance: number;
    spendable: boolean;
    delegate: AccountDelegate;
    script: string;
    counter: number;
}
export interface ManagerKey {
    manager: string;
    key: string;
}
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
export interface Operation {
    kind: string;
    source: string;
    fee: string;
    counter: string;
    storage_limit: string;
    gas_limit: string;
    delegate?: string;
    public_key?: string;
    manager_pubkey?: string;
    balance?: string;
    spendable?: boolean;
    delegatable?: boolean;
    destination?: string;
    amount?: string;
    script?: string | object;
    parameters?: string;
}
export interface Ballot {
    source: string;
    period: number;
    proposal: string;
    vote: BallotVote;
}
export interface ContractOriginationOperation extends Operation {
    script: string;
}
export interface ContractInvocationOperation extends Operation {
    parameters: string;
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
export declare enum BallotVote {
    Yay = 0,
    Nay = 1,
    Pass = 2
}
export interface Activation {
    pkh: string;
    secret: string;
}

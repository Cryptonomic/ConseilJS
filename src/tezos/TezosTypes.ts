/**
 * Types used to process data returned from Conseil server.
 */

export interface BlockHeader {
    level: number,
    proto: number,
    predecessor: string,
    timestamp: string,
    validation_pass: number,
    operations_hash: string,
    fitness: string[],
    context: string,
    priority: number,
    proof_of_work_nonce: string,
    signature: string
}

export interface BlockMetadata {
    protocol: string,
    chain_id: string,
    hash: string,
    metadata: BlockHeader
}

export interface AccountDelegate {
    setable: boolean,
    value: string
}

export interface Account {
    manager: string,
    balance: number,
    spendable: boolean,
    delegate: AccountDelegate,
    script: string,
    counter: number
}

export interface ManagerKey {
    manager: string,
    key: string
}

export interface AlphaOperationResult {
    status: string,
    originated_contracts: string[]
    errors: string[]
}

export interface AlphaOperationContentsAndResult {
    kind: string,
    metadata: AlphaOperationResult
}

export interface AlphaOperationsWithMetadata {
    contents: AlphaOperationContentsAndResult[],
    signature: string,
    kind: string, //only if error
    id: string, //only if error
    contract: string //only if error
}

export interface InjectedOperation {
    injectedOperation: string
}

export enum OperationKindFilter {
    SeedNonceRevelation = "seed_nonce_revelation",
    Delegation = "delegation",
    Transaction = "transaction",
    ActivateAccount = "activate_account",
    Origination = "origination",
    Reveal = "reveal",
    Endorsement = "endorsement",
}

export interface TezosBlockFilter {
  limit: number;
  block_id: string[];
  block_level: number[];
  block_netid: string[];
  block_protocol: string[];
}

export interface TezosAccountFilter {
  limit: number;
  account_id: string[];
  account_manager: string[];
  account_delegate: string[];
}

export interface TezosOperationFilter {
  limit: number;
  operation_id: string[];
  operation_source: string[];
  operation_destination: string[];
  operation_participant: string[];
  operation_kind: OperationKindFilter[];
}

/**
 * Filter with predicates for querying Conseil server
 * Se Conseil REST API documentation for usage.
 */
export type TezosFilter = TezosBlockFilter | TezosAccountFilter | TezosAccountFilter;

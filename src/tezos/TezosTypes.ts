/**
 * Types used to process data returned from Conseil server.
 */

export interface BlockMetadata {
    hash: string,
    chain_id: string,
    protocol: string,
    level: number,
    proto: number,
    predecessor: string,
    timestamp: string,
    validation_pass: number,
    operations_hash: string,
    fitness: string[],
    context: string,
    protocol_data: string
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

export interface ForgedOperation {
    operation: string
}

export interface AppliedOperationBalanceUpdates {
    kind: string,
    contract: string,
    debited: string,
    credit: string
}

export interface AppliedOperationError {
    kind: string,
    id: string,
    hash: string
}

export interface AppliedOperationResult {
    operation: string,
    status: string,
    operation_kind: string,
    balance_updates: AppliedOperationBalanceUpdates[],
    originated_contracts: string[],
    errors: AppliedOperationError[]
}

export interface AppliedOperation {
    kind: string,
    balance_updates: AppliedOperationBalanceUpdates[],
    operation_results: AppliedOperationResult[],
    id: string,
    contract: string
}

export interface InjectedOperation {
    injectedOperation: string
}
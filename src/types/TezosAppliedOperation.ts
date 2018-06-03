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

export interface TezosOperationResult {
    results: AppliedOperation,
    operationGroupID: string
}
/**
 * Types used for parsing data returned by Conseil backend API.
 */

export interface TezosBlock {
    level: number,
    proto: number,
    predecessor: string,
    timestamp: number,
    validationPass: number,
    fitness: string,
    context: string
    signature: string,
    protocol: string,
    chainId: string,
    hash: string,
    operationsHash: string
}

export interface TezosAccount {
    accountId: string,
    blockId: string,
    manager: string,
    spendable: boolean,
    delegateSetable: boolean,
    delegateValue: string,
    counter: number,
    script: string,
    balance: number
}

export interface TezosOperationGroup {
    protocol: string,
    chainId: string,
    hash: string,
    branch: string,
    signature: string,
    blockId: string
}

export interface TezosOperation {
    kind: string,
    source: string,
    amount: string,
    destination: string,
    //managerPubkey: string, //managerPubKey initially
    manager_pubkey: string,
    balance: string,
    delegate: string,
    operationGroupHash: string,
    operationId: number,
    fee: string,
    storageLimit: string,
    gasLimit: string,
    blockHash: string,
    timestamp: number,
    blockLevel: number
}

export interface TezosBlockWithOperationGroups {
    block: TezosBlock,
    operations: TezosBlock[]
}

export interface TezosOperationGroupWithOperations {
    operation_group: TezosOperationGroup,
    operations: TezosOperation[]
}

export interface TezosAccountWithOperationGroups {
    account: TezosAccount,
    operation_groups: TezosOperationGroup[]
}

export interface OperationFees {
    low: number,
    medium: number,
    high: number
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

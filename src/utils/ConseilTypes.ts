/**
 * Types used for parsing data returned by Conseil backend API.
 */

export interface TezosBlock {
    chainId: string,
    protocol: string,
    level: number,
    proto: number,
    predecessor: string,
    validationPass: number,
    operationsHash: string,
    protocolData: string,
    hash: string,
    timestamp: number,
    fitness: string,
    context: string
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
    hash: string,
    branch: string,
    kind: string,
    block: string,
    level: number,
    slots: number,
    signature: string,
    proposals: string,
    period: number,
    source: string,
    proposal: string,
    ballot: string,
    chain: string,
    counter: number,
    fee: number,
    blockId: string
}

export interface TezosOperation {
    operationId: number,
    operationGroupHash: string,
    opKind: string,
    level: number,
    nonce: string,
    id: string,
    publicKey: string,
    amount: string,
    destination: string,
    parameters: string,
    managerpubkey: string,
    balance: string,
    spendable: boolean,
    delegatable: boolean,
    delegate: string,
    script: string
}

export interface TezosOperationGroupWithOperations {
    operation_group: TezosOperationGroup,
    operations: TezosOperation[]
}

export interface TezosAccountWithOperationGroups {
    account: TezosAccount,
    operation_groups: TezosOperationGroup[]
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

export interface TezosOperationResult {
    results: AppliedOperation,
    operationGroupID: string
}
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
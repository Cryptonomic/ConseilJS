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

// abstracts Transaction, Delegations, and Originations
export interface Operation {
    kind: string,
    source: string,
    fee: string,
    counter: string,
    storage_limit: string,
    gas_limit: string,
    delegate?: String,
    public_key?: string,
    //managerPubkey?: string, // mainnet, alphanet
    manager_pubkey?: string, // zeronet
    balance?: string,
    spendable?: boolean,
    delegatable?: boolean,
    destination?: String,
    amount?: string
}
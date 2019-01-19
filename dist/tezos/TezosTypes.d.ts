/**
 * Types used to process data returned from Conseil server.
 */
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
    managerPubkey?: string;
    manager_pubkey?: string;
    balance?: string;
    spendable?: boolean;
    delegatable?: boolean;
    destination?: String;
    amount?: string;
}
/**
 * Types used to process data returned from Conseil server.
 */
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
    delegate?: String;
    public_key?: string;
    managerPubkey?: string;
    balance?: string;
    spendable?: boolean;
    delegatable?: boolean;
    destination?: String;
    amount?: string;
}
export interface ContractOriginationOperation {
    script: object;
    kind: string;
    source: string;
    fee: string;
    counter: string;
    storage_limit: string;
    gas_limit: string;
    delegate?: String;
    public_key?: string;
    managerPubkey?: string;
    balance?: string;
    spendable?: boolean;
    delegatable?: boolean;
    destination?: String;
    amount?: string;
}
export interface ContractInvocationOperation {
    kind: string;
    source: string;
    fee: string;
    counter: string;
    storage_limit: string;
    gas_limit: string;
    delegate?: String;
    public_key?: string;
    parameters: object;
    managerPubkey?: string;
    balance?: string;
    spendable?: boolean;
    delegatable?: boolean;
    destination?: string;
    amount?: string;
    script?: string;
}

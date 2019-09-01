/**
 * Types used to process data returned from the Tezos node.
 */

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

/**
 * Output of operation signing.
 */
export interface SignedOperationGroup {
    bytes: Buffer;
    signature: string;
}

/**
 * Result of a successfully sent operation
 */
export interface OperationResult {
    results: AlphaOperationsWithMetadata;
    operationGroupID: string;
}

export enum OperationKindType {
    SeedNonceRevelation = 'seed_nonce_revelation',
    Delegation = 'delegation',
    Transaction = 'transaction',
    AccountActivation = 'activate_account',
    Origination = 'origination',
    Reveal = 'reveal',
    Endorsement = "endorsement",
    Ballot = 'ballot',
    DoubleEndorsementEvidence = 'double_endorsement_evidence',
    DoubleBakingEvidence = 'double_baking_evidence',
    Proposal = 'proposals'
}

export enum TezosParameterFormat {
    Michelson = "michelson",
    Micheline = "micheline",
}

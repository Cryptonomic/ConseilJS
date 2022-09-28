/**
 * Type definitions for objects coming back from Tezos RPC calls.
 */

/**
 * Response for chains/<chain-id>/blocks/<block-id>
 */
export interface TezosBlock {
    protocol: string;
    chain_id: string;
    hash: string;
    header: TezosBlockHeader;
    metadata: TezosBlockMetadata;
    operations: TezosBlockOperationEnvelope[][];
}

export interface TezosBlockHeader {
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

export interface TezosBlockMetadata {
    protocol: string,
    next_protocol: string,
    test_chain_status: { status: string };
    max_operations_ttl: number;
    max_operation_data_length: number;
    max_block_header_length: number;
    max_operation_list_length: TezosBlockMetadataOperationListMax[];
    baker: string;
    level: TezosBlockMetadataLevel;
    voting_period_kind: string;
    nonce_hash: string | null;
    consumed_milligas: string;
    deactivated: any[];
    balance_updates: TezosBlockMetadataBalanceUpdate[];
}

export interface TezosBlockMetadataOperationListMax {
    max_size: number;
    max_op?: number;
}

export interface TezosBlockMetadataLevel {
    level: number;
    level_position: number;
    cycle: number;
    cycle_position: number;
    voting_period: number;
    voting_period_position: number;
    expected_commitment: boolean;
}

export interface TezosBlockMetadataBalanceUpdate {
    kind: string;
    change: string;
    contract?: string;
    category?: string;
    delegate?: string;
    cycle?: number;
}

export interface TezosBlockOperationEnvelope {
    protocol: string;
    chain_id: string;
    hash: string;
    branch: string;
    contents: TezosBlockOperationContent[];
    signature: string;
}

export interface TezosBlockOperationContent {
    kind: string;
    metadata: TezosBlockOperationContentMetadata;

    // endorsement
    level?: number; 

    // transaction
    source?: string;
    fee?: string;
    counter?: string;
    gas_limit?: string;
    storage_limit?: string;
    amount?: string;
    destination?: string;
}

export interface TezosBlockOperationContentMetadata {
    balance_updates: TezosBlockOperationContentMetadataBalanceUpdate[];
    delegate?: string;
    slots?: number[];
    operation_result?: TezosBlockOperationContentMetadataOperationResult;
}

export interface TezosBlockOperationContentMetadataBalanceUpdate {
    kind: string;
    change: string;
    contract?: string;
    category?: string,
    delegate?: string,
    cycle?: number;
}

export interface TezosBlockOperationContentMetadataOperationResult {
    status: string
    balance_updates: TezosBlockOperationContentMetadataBalanceUpdate[];
    consumed_milligas: string;
}

/**
 * Response for chains/<chain-id>/blocks/<block-id>/context/contracts/<account-id>
 */
export interface Contract {
    balance: string;
    delegate?: string;
    script?: any;
    counter: string;
}

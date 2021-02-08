/**
 * Various constants for the Tezos platforms. Fees are expressed in µtz unless otherwise noted, storage unit is bytes.
 */
export namespace TezosConstants {
    export const OperationGroupWatermark = '03';

    export const DefaultSimpleTransactionFee = 1420;
    export const DefaultTransactionStorageLimit = 496;
    export const DefaultTransactionGasLimit = 10600;

    export const DefaultDelegationFee = 1258;
    export const DefaultDelegationStorageLimit = 0;
    export const DefaultDelegationGasLimit = 1100;

    /**
     * Legacy constants for pre-P005 KT1 delegation account origination. Will be removed in a future release.
     * 
     * @deprecated
     */
    export const DefaultAccountOriginationFee = 1266;
    /**
     * Legacy constants for pre-P005 KT1 delegation account origination. Will be removed in a future release.
     * 
     * @deprecated
     */
    export const DefaultAccountOriginationStorageLimit = 496; // 277
    /**
     * Legacy constants for pre-P005 KT1 delegation account origination. Will be removed in a future release.
     * 
     * @deprecated
     */
    export const DefaultAccountOriginationGasLimit = 10600;

    export const DefaultKeyRevealFee = 1270;
    export const DefaultKeyRevealStorageLimit = 0;
    export const DefaultKeyRevealGasLimit = 1100;

    export const P005ManagerContractWithdrawalGasLimit = 26283;
    export const P005ManagerContractDepositGasLimit = 15285;
    export const P005ManagerContractWithdrawalStorageLimit = 496;

    export const P001StorageRate = 1_000_000 / 1000;
    export const P007StorageRate = 250_000 / 1000;
    export const StorageRate = P007StorageRate;

    export const BaseOperationFee = 100;

    export const P007OperationGasCap = 1_040_000;
    export const OperationGasCap = P007OperationGasCap;

    export const OperationStorageCap = 60_000;

    export const EmptyAccountStorageBurn = 257;

    export const DefaultBakerVig = 100;

    export const GasLimitPadding = 100;
    export const StorageLimitPadding = 20;

    /**
     * 
     */
    export const HeadBranchOffset = 54;

    /**
     * Outbound operation queue timeout in seconds. After this period, TezosOperationQueue will attempt to submit the transactions currently in queue.
     */
    export const DefaultBatchDelay = 25;

    /**
     * Mainnet block time in seconds.
     */
    export const DefaultBlockTime = 60;
}

export namespace TezosConstants {
    export const OperationGroupWatermark: string = '03';
    export const DefaultTransactionStorageLimit = 300;
    export const DefaultTransactionGasLimit = 10600;
    export const DefaultDelegationStorageLimit = 0;
    export const DefaultDelegationGasLimit = 10000;
    export const DefaultAccountOriginationStorageLimit = 277;
    export const DefaultAccountOriginationGasLimit = 10600;
    export const DefaultAccountOriginationFee = 1266;
    export const DefaultKeyRevealFee = 1270;
    export const DefaultDelegationFee = 1258;
    export const P005ManagerContractWithdrawalGasLimit = 26283;
    export const P005ManagerContractDepositGasLimit = 15285;
    export const P005ManagerContractWithdrawalStorageLimit = 300;

    /**
     * Outbound operation queue timeout in seconds. After this period, TezosOperationQueue will attempt to submit the transactions currently in queue.
     */
    export const DefaultBatchDelay: number = 25;

    /**
     * Mainnet block time in seconds.
     */
    export const DefaultBlockTime: number = 60;
}

import * as TezosTypes from '../../types/tezos/TezosChainTypes';
export declare namespace TezosNodeReader {
    function getBlock(server: string, hash: string): Promise<TezosTypes.BlockMetadata>;
    function getBlockHead(server: string): Promise<TezosTypes.BlockMetadata>;
    function getAccountForBlock(server: string, blockHash: string, accountHash: string): Promise<TezosTypes.Account>;
    function getAccountManagerForBlock(server: string, blockHash: string, accountHash: string): Promise<TezosTypes.ManagerKey>;
    function isImplicitAndEmpty(server: string, accountHash: string): Promise<boolean>;
    function isManagerKeyRevealedForAccount(server: string, accountHash: string): Promise<boolean>;
}

import { OperationFees, TezosAccount, TezosAccountWithOperationGroups, TezosBlock, TezosBlockWithOperationGroups, TezosOperation, TezosOperationGroup, TezosOperationGroupWithOperations } from "../../types/conseil/ConseilTezosTypes";
import { TezosFilter } from "../../types/tezos/TezosFilterType";
export declare namespace TezosConseilQuery {
    function getEmptyTezosFilter(): TezosFilter;
    function getBlockHead(server: string, apiKey: string): Promise<TezosBlock>;
    function getBlock(server: string, hash: String, apiKey: string): Promise<TezosBlockWithOperationGroups>;
    function getOperationGroup(server: string, hash: String, apiKey: string): Promise<TezosOperationGroupWithOperations>;
    function getOperationGroups(server: string, filter: TezosFilter, apiKey: string): Promise<TezosOperationGroup[]>;
    function getOperations(server: string, filter: TezosFilter, apiKey: string): Promise<TezosOperation[]>;
    function getAverageFees(server: string, filter: TezosFilter, apiKey: string): Promise<OperationFees>;
    function getAccount(server: string, hash: String, apiKey: string): Promise<TezosAccountWithOperationGroups>;
    function getBlocks(server: string, filter: TezosFilter, apiKey: string): Promise<TezosBlock[]>;
    function getAccounts(server: string, filter: TezosFilter, apiKey: string): Promise<TezosAccount[]>;
}

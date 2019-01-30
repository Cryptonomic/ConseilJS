import * as TezosTypes from './TezosTypes';
import { BlockMetadata } from "./TezosTypes";
export declare namespace TezosNode {
    function getBlock(server: string, hash: string): Promise<BlockMetadata>;
    function getBlockHead(server: string): Promise<TezosTypes.BlockMetadata>;
    function getAccountForBlock(server: string, blockHash: string, accountID: string): Promise<TezosTypes.Account>;
    function getAccountManagerForBlock(server: string, blockHash: string, accountID: string): Promise<TezosTypes.ManagerKey>;
    function forgeOperation(server: string, opGroup: object): Promise<string>;
    function applyOperation(server: string, payload: object): Promise<TezosTypes.AlphaOperationsWithMetadata[]>;
    function injectOperation(server: string, payload: string): Promise<string>;
}

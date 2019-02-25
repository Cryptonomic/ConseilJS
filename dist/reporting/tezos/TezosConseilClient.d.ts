import { ConseilQuery, ConseilServerInfo } from "../../types/conseil/QueryTypes";
export declare namespace TezosConseilClient {
    function getTezosEntityData(serverInfo: ConseilServerInfo, network: string, entity: string, query: ConseilQuery): Promise<any[]>;
    function getBlockHead(serverInfo: ConseilServerInfo, network: string): Promise<any[]>;
    function getBlock(serverInfo: ConseilServerInfo, network: string, hash: string): Promise<any[]>;
    function getAccount(serverInfo: ConseilServerInfo, network: string, accountID: string): Promise<any[]>;
    function getOperationGroup(serverInfo: ConseilServerInfo, network: string, operationGroupID: string): Promise<any[]>;
    function getBlocks(serverInfo: ConseilServerInfo, network: string, query: ConseilQuery): Promise<any[]>;
    function getAccounts(serverInfo: ConseilServerInfo, network: string, query: ConseilQuery): Promise<any[]>;
    function getOperationGroups(serverInfo: ConseilServerInfo, network: string, query: ConseilQuery): Promise<any[]>;
    function getOperations(serverInfo: ConseilServerInfo, network: string, query: ConseilQuery): Promise<any[]>;
}

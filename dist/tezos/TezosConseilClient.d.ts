import { ConseilQuery, ConseilServerInfo } from "../utils/v2/QueryTypes";
export declare namespace TezosConseilClient {
    function getTezosEntityData(serverInfo: ConseilServerInfo, network: string, entity: string, query: ConseilQuery): Promise<object>;
    function getBlockHead(serverInfo: ConseilServerInfo, network: string): Promise<object>;
    function getBlock(serverInfo: ConseilServerInfo, network: string, hash: string): Promise<object>;
    function getAccount(serverInfo: ConseilServerInfo, network: string, accountID: string): Promise<object>;
    function getOperationGroup(serverInfo: ConseilServerInfo, network: string, operationGroupID: string): Promise<object>;
    function getBlocks(serverInfo: ConseilServerInfo, network: string, query: ConseilQuery): Promise<object>;
    function getAccounts(serverInfo: ConseilServerInfo, network: string, query: ConseilQuery): Promise<object>;
    function getOperationGroups(serverInfo: ConseilServerInfo, network: string, query: ConseilQuery): Promise<object>;
    function getOperations(serverInfo: ConseilServerInfo, network: string, query: ConseilQuery): Promise<object>;
}

import { ConseilServerInfo, ConseilQuery } from "../v2/QueryTypes";
export declare namespace ConseilDataClient {
    function executeEntityQuery(serverInfo: ConseilServerInfo, platform: string, network: string, entity: string, query: ConseilQuery): Promise<object>;
    function executeComplexQuery(serverInfo: ConseilServerInfo, platform: string, network: string, query: ConseilQuery): Promise<object>;
}

import { ConseilServerInfo, ConseilQuery } from '../types/conseil/QueryTypes';
export declare namespace ConseilDataClient {
    function executeEntityQuery(serverInfo: ConseilServerInfo, platform: string, network: string, entity: string, query: ConseilQuery): Promise<any[]>;
    function executeComplexQuery(serverInfo: ConseilServerInfo, platform: string, network: string, query: ConseilQuery): Promise<any[]>;
}

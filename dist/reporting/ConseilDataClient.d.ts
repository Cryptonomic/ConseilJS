import { ConseilServerInfo, ConseilQuery } from '../types/conseil/QueryTypes';
export declare namespace ConseilDataClient {
    function executeEntityQuery(serverInfo: ConseilServerInfo, platform: string, network: string, entity: string, query: ConseilQuery): Promise<any[]>;
}

import {ConseilServerInfo, ConseilQuery} from "../v2/ConseilQuery";

/**
 * Utility functions for querying backend Conseil v2 API for metadata
 */
export class ConseilDataClient {
    /**
     * Requests data for a specific entity for a given platform/network combination, for example a block or an operation.
     * 
     * @param server A fully qualified base URL for a Conseil server instance
     * @param apiKey Conseil API key
     * @param platform 
     * @param network 
     * @param entity 
     * @param query 
     */
    async executeEntityQuery(serverInfo: ConseilServerInfo, platform: string, network: string, entity: string, query: ConseilQuery): Promise<object> {
        return fetch(`${serverInfo.url}/v2/data/${platform}/${network}/${entity}`, {
            method: 'POST',
            headers: { "apiKey": serverInfo.apiKey },
            body: JSON.stringify(query)
        }).then(response => { return response.json() });
    }

    /**
     * Requests data that may return result set composed of attributes of multiple entities.
     * 
     * @param server A fully qualified base URL for a Conseil server instance
     * @param apiKey Conseil API key
     * @param platform 
     * @param network 
     * @param query 
     */
    async executeComplexQuery(serverInfo: ConseilServerInfo, platform: string, network: string, query: ConseilQuery): Promise<object> {
        return fetch(`${serverInfo.url}/v2/query/${platform}/${network}`, {
            method: 'POST',
            headers: { "apiKey": serverInfo.apiKey },
            body: JSON.stringify(query)
        }).then(response => { return response.json() });
    }
}

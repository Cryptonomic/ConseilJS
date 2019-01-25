import {ConseilQuery} from "../v2/ConseilQuery";

/**
 * Utility functions for querying backend Conseil v2 API for metadata
 */
export class ConseilDataClient {
    async executeEntityQuery(apiKey: string, server: string, platform: string, network: string, entity: string, query: ConseilQuery): Promise<object> {
        return fetch(`${server}/v2/data/${platform}/${network}/${entity}`, {
            method: 'POST',
            headers: { "apiKey": apiKey },
            body: JSON.stringify(query)
        }).then(response => { return response.json() });
    }

    async executeComplexQuery(apiKey: string, server: string, platform: string, network: string, query: ConseilQuery): Promise<object> {
        return fetch(`${server}/v2/query/${platform}/${network}`, {
            method: 'POST',
            headers: { "apiKey": apiKey },
            body: JSON.stringify(query)
        }).then(response => { return response.json() });
    }
}

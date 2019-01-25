import {ConseilFilter} from "../v2/ConseilQuery";

/**
 * Utility functions for querying backend Conseil v2 API for metadata
 */
export class ConseilDataClient {
    async runDataQuery(apiKey: string, server: string, platform: string, network: string, entity: string, filter: ConseilFilter): Promise<object> {
        return fetch(`${server}/v2/data/${platform}/${network}/${entity}`, {
            method: 'POST',
            headers: { "apiKey": apiKey },
            body: JSON.stringify(filter)
        }).then(response => {return response.json()});
    }
}

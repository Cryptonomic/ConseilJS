import {ConseilServerInfo, ConseilQuery} from '../types/conseil/QueryTypes';
import {ConseilRequestError, ConseilResponseError} from '../types/conseil/ErrorTypes';
import FetchSelector from '../utils/FetchSelector';

const fetch = FetchSelector.getFetch();

/**
 * Utility functions for querying backend Conseil v2 API for metadata
 */
export namespace ConseilDataClient {
    /**
     * Requests data for a specific entity for a given platform/network combination, for example a block or an operation.
     * 
     * @param serverInfo Conseil server connection definition.
     * @param platform Platform to query, eg: Tezos.
     * @param network Network to query, eg: mainnet.
     * @param entity Entity to query, eg: block, account, operation, etc.
     * @param query JSON object confirming to the Conseil query spec.
     */
    export async function executeEntityQuery(serverInfo: ConseilServerInfo, platform: string, network: string, entity: string, query: ConseilQuery): Promise<any[]> {
        const url = `${serverInfo.url}/v2/data/${platform}/${network}/${entity}`

        return fetch(url, {
            method: 'post',
            headers: { 'apiKey': serverInfo.apiKey, 'Content-Type': 'application/json' },
            body: JSON.stringify(query)
        })
        .then(response => {
            if (!response.ok) { throw new ConseilRequestError(response.status, response.statusText, url, query); }
            return response;
        })
        .then(response => {
            try {
                return response.json();
            } catch {
                throw new ConseilResponseError(response.status, response.statusText, url, null, response);
            }
        });
    }

    /**
     * Requests data that may return result set composed of attributes of multiple entities.
     * 
     * @param serverInfo Conseil server connection definition.
     * @param platform Platform to query, eg: Tezos.
     * @param network Network to query, eg: mainnet.
     * @param query JSON object confirming to the Conseil query spec.
     */
    export async function executeComplexQuery(serverInfo: ConseilServerInfo, platform: string, network: string, query: ConseilQuery): Promise<any[]> {
        const url = `${serverInfo.url}/v2/query/${platform}/${network}`;
        return fetch(url, {
            method: 'post',
            headers: { 'apiKey': serverInfo.apiKey, 'Content-Type': 'application/json' },
            body: JSON.stringify(query)
        })
        .then(response => {
            if (!response.ok) { throw new ConseilRequestError(response.status, response.statusText, url, query); }
            return response;
        })
        .then(response => {
            try {
                return response.json();
            } catch {
                throw new ConseilResponseError(response.status, response.statusText, url, null, response);
            }
        });
    }
}

import {ConseilServerInfo, ConseilQuery} from '../types/conseil/QueryTypes';
import {ConseilRequestError} from '../types/conseil/ErrorTypes';
import FetchSelector from '../utils/FetchSelector';
import LogSelector from '../utils/LoggerSelector';

const log = LogSelector.getLogger();
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
     * @param query JSON object or text confirming to the Conseil query spec.
     */
    export async function executeEntityQuery(serverInfo: ConseilServerInfo, platform: string, network: string, entity: string, query: ConseilQuery): Promise<any[]> {
        const url = `${serverInfo.url}/v2/data/${platform}/${network}/${entity}`

        log.debug(`ConseilDataClient.executeEntityQuery request: ${url}`);

        return fetch(url, {
            method: 'post',
            headers: { 'apiKey': serverInfo.apiKey, 'Content-Type': 'application/json' },
            body: JSON.stringify(query)
        })
        .then(r => {
            if (!r.ok) { throw new ConseilRequestError(r.status, r.statusText, url, query); }
            return r;
        })
        .then(r => {
            const isJSONResponse: boolean = r.headers.get('content-type').toLowerCase().includes('application/json');
            const response = isJSONResponse ? r.json() : r.text();

            log.debug(`ConseilDataClient.executeEntityQuery response: ${isJSONResponse ? JSON.stringify(r.json()) : r.text()}`);

            return response;
        });
    }
}

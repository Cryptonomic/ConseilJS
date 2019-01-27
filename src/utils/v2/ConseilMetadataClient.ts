import {ConseilServerInfo} from "../v2/ConseilQuery";

/**
 * Utility functions for querying backend Conseil v2 API for metadata
 */
export class ConseilMetadataClient {
    async executeMetadataQuery(serverInfo: ConseilServerInfo, route: string): Promise<object> {
        return fetch(`${serverInfo.url}/v2/metadata/${route}`, {
            method: 'GET',
            headers: { "apiKey": serverInfo.apiKey },
        }).then(response => { return response.json() });
    }

    /**
     * Retrieves the list of available platforms, for example: 'tezos'.
     * 
     * @param server A fully qualified base URL for a Conseil server instance
     * @param apiKey Conseil API key
     */
    async getPlatforms(server: string, apiKey: string): Promise<object> {
        return this.executeMetadataQuery({ "url": server, "apiKey": apiKey }, 'platforms');
    }

    /**
     * Retrieves the list of available networks given a platform, for example: 'mainnet', 'alphanet', as is the case with tezos.
     * 
     * @param server A fully qualified base URL for a Conseil server instance
     * @param apiKey Conseil API key
     * @param platform Platform of interest
     * 
     * @see {@link getPlatforms}
     */
    async getNetworks(server: string, apiKey: string, platform: string): Promise<object> {
        return this.executeMetadataQuery({ "url": server, "apiKey": apiKey }, `${platform}/networks`);
    }

    /**
     * Retrieves a list of entities given a network, for example: 'block', 'operation', 'account'.
     * 
     * @param server A fully qualified base URL for a Conseil server instance
     * @param apiKey Conseil API key
     * @param platform A platform
     * @param network Network of interest
     * 
     * @see {@link getNetworks}
     */
    async getEntities(server: string, apiKey: string, platform: string, network: string): Promise<object> {
        return this.executeMetadataQuery({ "url": server, "apiKey": apiKey }, `${platform}/${network}/entities`);
    }

    /**
     * Retrieves a list of attributes for an entity.
     * 
     * @param server A fully qualified base URL for a Conseil server instance
     * @param apiKey Conseil API key
     * @param platform A platform
     * @param network A network
     * @param entity Entity of interest
     * 
     * @see {@link getEntities}
     */
    async getAttributes(server: string, apiKey: string, platform: string, network: string, entity: string): Promise<object> {
        return this.executeMetadataQuery({ "url": server, "apiKey": apiKey }, `${platform}/${network}/${entity}/attributes`);
    }

    /**
     * Retrieves a list of distinct values for a specific attribute of an entity. This would work on low-cardinality, generally non-date and non-numeric data. The intended use-case for this result set is type-ahead auto-complete.
     * 
     * @param server A fully qualified base URL for a Conseil server instance
     * @param apiKey Conseil API key
     * @param platform A platform
     * @param network A network
     * @param entity An entity
     * @param attribute Attribute of interest
     * 
     * @see {@link getAttributes}
     */
    async getAttributeValues(server: string, apiKey: string, platform: string, network: string, entity: string, attribute: string): Promise<object> {
        return this.executeMetadataQuery({ "url": server, "apiKey": apiKey }, `${platform}/${network}/${entity}/${attribute}`);
    }
}

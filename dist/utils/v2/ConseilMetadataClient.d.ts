import { ConseilServerInfo } from "../v2/ConseilQuery";
/**
 * Utility functions for querying backend Conseil v2 API for metadata
 */
export declare class ConseilMetadataClient {
    executeMetadataQuery(serverInfo: ConseilServerInfo, route: string): Promise<object>;
    /**
     * Retrieves the list of available platforms, for example: 'tezos'.
     *
     * @param server A fully qualified base URL for a Conseil server instance
     * @param apiKey Conseil API key
     */
    getPlatforms(server: string, apiKey: string): Promise<object>;
    /**
     * Retrieves the list of available networks given a platform, for example: 'mainnet', 'alphanet', as is the case with tezos.
     *
     * @param server A fully qualified base URL for a Conseil server instance
     * @param apiKey Conseil API key
     * @param platform Platform of interest
     *
     * @see {@link getPlatforms}
     */
    getNetworks(server: string, apiKey: string, platform: string): Promise<object>;
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
    getEntities(server: string, apiKey: string, platform: string, network: string): Promise<object>;
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
    getAttributes(server: string, apiKey: string, platform: string, network: string, entity: string): Promise<object>;
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
    getAttributeValues(server: string, apiKey: string, platform: string, network: string, entity: string, attribute: string): Promise<object>;
}

import { ConseilServerInfo } from "../v2/QueryTypes";
import { PlatformDefinition, NetworkDefinition, EntityDefinition, AttributeDefinition } from "../v2/MetadataTypes";
/**
 * Utility functions for querying backend Conseil v2 API for metadata
 */
export declare namespace ConseilMetadataClient {
    function executeMetadataQuery(serverInfo: ConseilServerInfo, route: string): Promise<any>;
    /**
     * Retrieves the list of available platforms, for example: 'tezos'.
     *
     * @param server A fully qualified base URL for a Conseil server instance
     * @param apiKey Conseil API key
     */
    function getPlatforms(server: string, apiKey: string): Promise<PlatformDefinition[]>;
    /**
     * Retrieves the list of available networks given a platform, for example: 'mainnet', 'alphanet', as is the case with tezos.
     *
     * @param server A fully qualified base URL for a Conseil server instance
     * @param apiKey Conseil API key
     * @param platform Platform of interest
     *
     * @see {@link getPlatforms}
     */
    function getNetworks(server: string, apiKey: string, platform: string): Promise<NetworkDefinition[]>;
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
    function getEntities(server: string, apiKey: string, platform: string, network: string): Promise<EntityDefinition[]>;
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
    function getAttributes(server: string, apiKey: string, platform: string, network: string, entity: string): Promise<AttributeDefinition[]>;
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
    function getAttributeValues(server: string, apiKey: string, platform: string, network: string, entity: string, attribute: string): Promise<string[]>;
}

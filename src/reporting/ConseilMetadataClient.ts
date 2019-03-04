import {ConseilServerInfo} from '../types/conseil/QueryTypes'
import {PlatformDefinition, NetworkDefinition, EntityDefinition, AttributeDefinition} from '../types/conseil/MetadataTypes';
import FetchSelector from '../utils/FetchSelector';

const fetch = FetchSelector.getFetch();

/**
 * Utility functions for querying backend Conseil v2 API for metadata
 */
export namespace ConseilMetadataClient {
    export async function executeMetadataQuery(serverInfo: ConseilServerInfo, route: string): Promise<any> {
        return fetch(`${serverInfo.url}/v2/metadata/${route}`, {
            method: 'GET',
            headers: { 'apiKey': serverInfo.apiKey },
        }).then(response => response.json());
    }

    /**
     * Retrieves the list of available platforms, for example: 'tezos'.
     * 
     * @param server A fully qualified base URL for a Conseil server instance
     * @param apiKey Conseil API key
     */
    export async function getPlatforms(serverInfo: ConseilServerInfo): Promise<PlatformDefinition[]> {
        return executeMetadataQuery(serverInfo, 'platforms');
    }

    /**
     * Retrieves the list of available networks given a platform, for example: 'mainnet', 'alphanet', as is the case with tezos.
     * 
     * @param serverInfo Conseil server connection definition.
     * @param platform Platform of interest
     * 
     * @see {@link getPlatforms}
     */
    export async function getNetworks(serverInfo: ConseilServerInfo, platform: string): Promise<NetworkDefinition[]> {
        return executeMetadataQuery(serverInfo, `${platform}/networks`);
    }

    /**
     * Retrieves a list of entities given a network, for example: 'block', 'operation', 'account'.
     * 
     * @param serverInfo Conseil server connection definition.
     * @param platform A platform
     * @param network Network of interest
     * 
     * @see {@link getNetworks}
     */
    export async function getEntities(serverInfo: ConseilServerInfo, platform: string, network: string): Promise<EntityDefinition[]> {
        return executeMetadataQuery(serverInfo, `${platform}/${network}/entities`);
    }

    /**
     * Retrieves a list of attributes for an entity.
     * 
     * @param serverInfo Conseil server connection definition.
     * @param platform A platform
     * @param network A network
     * @param entity Entity of interest
     * 
     * @see {@link getEntities}
     */
    export async function getAttributes(serverInfo: ConseilServerInfo, platform: string, network: string, entity: string): Promise<AttributeDefinition[]> {
        return executeMetadataQuery(serverInfo, `${platform}/${network}/${entity}/attributes`);
    }

    /**
     * Retrieves a list of distinct values for a specific attribute of an entity. This would work on low-cardinality, generally non-date and non-numeric data. The intended use-case for this result set is type-ahead auto-complete.
     * 
     * @param serverInfo Conseil server connection definition.
     * @param platform A platform
     * @param network A network
     * @param entity An entity
     * @param attribute Attribute of interest
     * 
     * @see {@link getAttributes}
     */
    export async function getAttributeValues(serverInfo: ConseilServerInfo, platform: string, network: string, entity: string, attribute: string): Promise<string[]> {
        return executeMetadataQuery(serverInfo, `${platform}/${network}/${entity}/${attribute}`);
    }
}

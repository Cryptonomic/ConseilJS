import { ConseilServerInfo } from '../types/conseil/QueryTypes';
import { PlatformDefinition, NetworkDefinition, EntityDefinition, AttributeDefinition } from '../types/conseil/MetadataTypes';
export declare namespace ConseilMetadataClient {
    function executeMetadataQuery(serverInfo: ConseilServerInfo, route: string): Promise<any>;
    function getPlatforms(serverInfo: ConseilServerInfo): Promise<PlatformDefinition[]>;
    function getNetworks(serverInfo: ConseilServerInfo, platform: string): Promise<NetworkDefinition[]>;
    function getEntities(serverInfo: ConseilServerInfo, platform: string, network: string): Promise<EntityDefinition[]>;
    function getAttributes(serverInfo: ConseilServerInfo, platform: string, network: string, entity: string): Promise<AttributeDefinition[]>;
    function getAttributeValues(serverInfo: ConseilServerInfo, platform: string, network: string, entity: string, attribute: string): Promise<string[]>;
}

import { ConseilServerInfo } from "../v2/QueryTypes";
import { PlatformDefinition, NetworkDefinition, EntityDefinition, AttributeDefinition } from "../v2/MetadataTypes";
export declare namespace ConseilMetadataClient {
    function executeMetadataQuery(serverInfo: ConseilServerInfo, route: string): Promise<any>;
    function getPlatforms(server: string, apiKey: string): Promise<PlatformDefinition[]>;
    function getNetworks(server: string, apiKey: string, platform: string): Promise<NetworkDefinition[]>;
    function getEntities(server: string, apiKey: string, platform: string, network: string): Promise<EntityDefinition[]>;
    function getAttributes(server: string, apiKey: string, platform: string, network: string, entity: string): Promise<AttributeDefinition[]>;
    function getAttributeValues(server: string, apiKey: string, platform: string, network: string, entity: string, attribute: string): Promise<string[]>;
}

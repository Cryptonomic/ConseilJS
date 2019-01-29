export interface PlatformDefinition {
    name: string;
    displayName: string;
}
export interface NetworkDefinition {
    name: string;
    displayName: string;
    platform: string;
    network: string;
}
export interface EntityDefinition {
    name: string;
    displayName: string;
    count: number;
    network: string;
}
export interface AttributeDefinition {
    name: string;
    displayName: string;
    dataType: string;
    cardinality: number;
    keyType: string;
    entity: string;
}

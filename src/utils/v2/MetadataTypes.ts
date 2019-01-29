export interface PlatformDefinition {
    name: string,
    displayName: string
}

export interface NetworkDefinition {
    name: string,
    displayName: string,
    platform: string,
    network: string
}

export interface EntityDefinition {
    name: string,
    displayName: string,
    count: number,
    network: string
}

export interface AttributeDefinition {
    name: string,
    displayName: string,
    dataType: string, // TODO should be enum
    cardinality: number,
    keyType: string, // TODO should be enum
    entity: string
}

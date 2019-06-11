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
    displayNamePlural: string;
    count: number;
    network: string;
}
export interface AttributeDefinition {
    name: string;
    displayName: string;
    dataType: AttrbuteDataType;
    cardinality: number;
    keyType: AttrbuteKeyType;
    entity: string;
    dataFormat: string;
    visible: boolean;
    scale?: number;
    description?: string;
    placeholder?: string;
    reference?: AttributeReference;
}
export interface AttributeReference {
    entity: string;
    key: string;
}
export declare enum AttrbuteDataType {
    STRING = "String",
    INT = "Int",
    DECIMAL = "Decimal",
    BOOLEAN = "Boolean",
    ACCOUNT_ADDRESS = "AccountAddress",
    HASH = "Hash"
}
export declare enum AttrbuteKeyType {
    PRIMARYKEY = "PrimaryKey",
    UNIQUEKEY = "UniqueKey",
    NONKEY = "NonKey"
}

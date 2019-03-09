export const platformsResponse = [
    {
        "name": "tezos",
        "displayName": "Tezos"
    }
];

export const networksResponse = [
    {
        "name": "alphanet",
        "displayName": "Alphanet",
        "platform": "tezos",
        "network": "alphanet"
    },
    {
        "name": "zeronet",
        "displayName": "Zeronet",
        "platform": "tezos",
        "network": "zeronet"
    }
]

export const entityResponse = [
    {
        "name": "blocks",
        "displayName": "Blocks",
        "count": 226010
    },
    {
        "name": "accounts",
        "displayName": "Accounts",
        "count": 16565
    },
    {
        "name": "operation_groups",
        "displayName": "Operation groups",
        "count": 1698153
    },
    {
        "name": "operations",
        "displayName": "Operations",
        "count": 1721132
    },
    {
        "name": "fees",
        "displayName": "Fees",
        "count": 6979
    }
];

export const blockAttributeResponse = [
    {
        "name": "level",
        "displayName": "Level",
        "dataType": "Int",
        "cardinality": null,
        "keyType": "UniqueKey",
        "entity": "blocks"
    },
    {
        "name": "proto",
        "displayName": "Proto",
        "dataType": "Int",
        "cardinality": null,
        "keyType": "UniqueKey",
        "entity": "blocks"
    },
    {
        "name": "predecessor",
        "displayName": "Predecessor",
        "dataType": "String",
        "cardinality": 226011,
        "keyType": "NonKey",
        "entity": "blocks"
    },
    {
        "name": "timestamp",
        "displayName": "Timestamp",
        "dataType": "DateTime",
        "cardinality": null,
        "keyType": "UniqueKey",
        "entity": "blocks"
    },
    {
        "name": "validation_pass",
        "displayName": "Validation pass",
        "dataType": "Int",
        "cardinality": null,
        "keyType": "UniqueKey",
        "entity": "blocks"
    },
    {
        "name": "fitness",
        "displayName": "Fitness",
        "dataType": "String",
        "cardinality": 226012,
        "keyType": "UniqueKey",
        "entity": "blocks"
    },
    {
        "name": "context",
        "displayName": "Context",
        "dataType": "String",
        "cardinality": 226012,
        "keyType": "UniqueKey",
        "entity": "blocks"
    },
    {
        "name": "signature",
        "displayName": "Signature",
        "dataType": "String",
        "cardinality": 226011,
        "keyType": "NonKey",
        "entity": "blocks"
    },
    {
        "name": "protocol",
        "displayName": "Protocol",
        "dataType": "String",
        "cardinality": 3,
        "keyType": "NonKey",
        "entity": "blocks"
    },
    {
        "name": "chain_id",
        "displayName": "Chain id",
        "dataType": "String",
        "cardinality": 1,
        "keyType": "NonKey",
        "entity": "blocks"
    },
    {
        "name": "hash",
        "displayName": "Hash",
        "dataType": "String",
        "cardinality": 226012,
        "keyType": "UniqueKey",
        "entity": "blocks"
    },
    {
        "name": "operations_hash",
        "displayName": "Operations hash",
        "dataType": "String",
        "cardinality": 225682,
        "keyType": "NonKey",
        "entity": "blocks"
    }
];

export const accountAttributeValueResponse = [ "f", "t" ];
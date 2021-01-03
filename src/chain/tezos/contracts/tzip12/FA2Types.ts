// contract storage and deployment
export interface StoragePair {

}

export interface DeployPair {

}

export function DeployPairMicheline(): string {
    return ``;
}

// mint
export interface MintPair {
    address: string;
    amount: number;
    sym: string;
    token_id: number;
}

export function MintPairMicheline(mint: MintPair): string {
    return `{
        "prim": "Pair",
        "args": [
            { "prim": "Pair", "args": [ { "string": "${mint.address}" }, { "int": "${mint.amount}" } ] },
            { "prim": "Pair", "args": [ { "string": "${mint.sym}" }, { "int": "${mint.token_id}" } ] }
        ]
    }`;
}

// burn
export interface BurnPair {
    address: string;
    amount: number;
    sym: string;
    token_id: number;
}

export function BurnPairMicheline(burn: BurnPair): string {
    return `{
        "prim": "Pair", 
        "args": [ { "string": "${burn.address}" }, 
            { "prim": "Pair", "args": [ { "int": "${burn.amount}" }, { "int": "${burn.token_id}" } ] } 
        ]
    }`;
}


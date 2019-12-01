export interface Parameter {
    name?: string;
    type: string;
}

export interface EntryPoint {
    name?: string;
    parameters: Parameter[];
    structure: string;
    generateInvocationString(... vars: any[]): string;
    generateInvocationPair(...vars: any[]): { entrypoint: string, value: any };
}
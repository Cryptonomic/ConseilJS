export interface Parameter {
    type: string;
    name?: string;
    optional?: boolean;
    constituentType?: string;
}

export interface EntryPoint {
    name?: string;
    parameters: Parameter[];
    structure: string;
    generateInvocationString(...vars: any[]): string;
    generateInvocationPair(...vars: any[]): { entrypoint: string, parameters: any };
    generateSampleInvocation(): string;
}
export interface Parameter {
    name?: string;
    type: string;
}
export interface EntryPoint {
    name?: string;
    parameters: Parameter[];
    structure: string;
    generateParameter(...vars: any[]): string;
}

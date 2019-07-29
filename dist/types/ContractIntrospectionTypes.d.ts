export interface Parameter {
    name?: string;
    type: string;
}
export interface Entrypoint {
    name?: string;
    parameters: Parameter[];
    structure: string;
    generateParameter?(...vars: any[]): string;
}

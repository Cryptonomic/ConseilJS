import { Response } from 'node-fetch';
export declare function runGetQuery(server: string, command: string): Promise<object>;
export declare function runPostQuery(server: string, command: string, payload?: {}): Promise<Response>;

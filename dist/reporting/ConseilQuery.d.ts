import { TezosFilter } from "../types/tezos/TezosFilterType";
export declare function queryConseilServer(server: string, route: string, apiKey: string): Promise<object>;
export declare function queryConseilServerWithFilter(server: string, route: string, filter: TezosFilter, apiKey: string): Promise<object>;

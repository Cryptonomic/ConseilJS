import { TezosFilter } from "..";
/**
 * Utility functions for querying backend Conseil API
 */
/**
 * Runs a query against Conseil backend API
 * TODO: Also make the blockchain a parameter
 * @param {string} server  Conseil server to go against
 * @param {string} route API route to query
 * @param {string} apiKey    API key to use for Conseil server.
 * @returns {Promise<object>}   JSON representation of response from Conseil
 */
export declare function queryConseilServer(server: string, route: string, apiKey: string): Promise<object>;
/**
 * Runs a query against Conseil backend API with the given filter
 * @param {string} server  Conseil server to go against
 * @param {string} route    API route to query
 * @param {TezosFilter} filter  Conseil filter
 * @param {string} apiKey    API key to use for Conseil server.
 * @returns {Promise<object>}   Data returned by Conseil as a JSON object
 */
export declare function queryConseilServerWithFilter(server: string, route: string, filter: TezosFilter, apiKey: string): Promise<object>;

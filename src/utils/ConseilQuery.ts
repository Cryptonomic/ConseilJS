import * as querystring from "querystring";
import fetch from "node-fetch";
import { TezosFilter } from "../tezos/TezosTypes";

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
export function queryConseilServer(
  server: string,
  route: string,
  apiKey: string
): Promise<object> {
  const url = `${server}/${route}`;
  console.log(`Querying Conseil server at URL ${url}`);
  return fetch(url, {
    method: "get",
    headers: {
      apiKey: apiKey
    }
  }).then(response => {
    return response.json();
  });
}

/**
 * Runs a query against Conseil backend API with the given filter
 * @param {string} server  Conseil server to go against
 * @param {string} route    API route to query
 * @param {TezosFilter} filter  Conseil filter
 * @param {string} apiKey    API key to use for Conseil server.
 * @returns {Promise<object>}   Data returned by Conseil as a JSON object
 */
export function queryConseilServerWithFilter(
  server: string,
  route: string,
  filter: TezosFilter,
  apiKey: string
): Promise<object> {
  const params = querystring.stringify(sanitizeFilter(filter));
  const cmdWithParams = `${route}?${params}`;
  return queryConseilServer(server, cmdWithParams, apiKey);
}

/**
 * Removes extraneous data from Conseil fitler predicates.
 * @param {TezosFilter} filter  Conseil filter
 * @returns {TezosFilter}   Sanitized Conseil filter
 */
function sanitizeFilter(filter: TezosFilter): object {
  return Object.keys(filter)
    .filter((key: string) => filter[key].filter(Boolean))
    .map((key: string) => filter[key]);
}

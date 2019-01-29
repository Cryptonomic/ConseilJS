"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Utility functions for querying backend Conseil v2 API for metadata
 */
var ConseilDataClient;
(function (ConseilDataClient) {
    /**
     * Requests data for a specific entity for a given platform/network combination, for example a block or an operation.
     *
     * @param serverInfo Conseil server connection definition.
     * @param platform Platform to query, eg: Tezos.
     * @param network Network to query, eg: mainnet.
     * @param entity Entity to query, eg: block, account, operation, etc.
     * @param query JSON object confirming to the Conseil query spec.
     */
    function executeEntityQuery(serverInfo, platform, network, entity, query) {
        return __awaiter(this, void 0, void 0, function* () {
            return fetch(`${serverInfo.url}/v2/data/${platform}/${network}/${entity}`, {
                method: 'POST',
                headers: { "apiKey": serverInfo.apiKey },
                body: JSON.stringify(query)
            }).then(response => { return response.json(); });
        });
    }
    ConseilDataClient.executeEntityQuery = executeEntityQuery;
    /**
     * Requests data that may return result set composed of attributes of multiple entities.
     *
     * @param serverInfo Conseil server connection definition.
     * @param platform Platform to query, eg: Tezos.
     * @param network Network to query, eg: mainnet.
     * @param query JSON object confirming to the Conseil query spec.
     */
    function executeComplexQuery(serverInfo, platform, network, query) {
        return __awaiter(this, void 0, void 0, function* () {
            return fetch(`${serverInfo.url}/v2/query/${platform}/${network}`, {
                method: 'POST',
                headers: { "apiKey": serverInfo.apiKey },
                body: JSON.stringify(query)
            }).then(response => { return response.json(); });
        });
    }
    ConseilDataClient.executeComplexQuery = executeComplexQuery;
})(ConseilDataClient = exports.ConseilDataClient || (exports.ConseilDataClient = {}));
//# sourceMappingURL=ConseilDataClient.js.map
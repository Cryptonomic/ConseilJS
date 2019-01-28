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
class ConseilMetadataClient {
    executeMetadataQuery(serverInfo, route) {
        return __awaiter(this, void 0, void 0, function* () {
            return fetch(`${serverInfo.url}/v2/metadata/${route}`, {
                method: 'GET',
                headers: { "apiKey": serverInfo.apiKey },
            }).then(response => { return response.json(); });
        });
    }
    /**
     * Retrieves the list of available platforms, for example: 'tezos'.
     *
     * @param server A fully qualified base URL for a Conseil server instance
     * @param apiKey Conseil API key
     */
    getPlatforms(server, apiKey) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.executeMetadataQuery({ "url": server, "apiKey": apiKey }, 'platforms');
        });
    }
    /**
     * Retrieves the list of available networks given a platform, for example: 'mainnet', 'alphanet', as is the case with tezos.
     *
     * @param server A fully qualified base URL for a Conseil server instance
     * @param apiKey Conseil API key
     * @param platform Platform of interest
     *
     * @see {@link getPlatforms}
     */
    getNetworks(server, apiKey, platform) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.executeMetadataQuery({ "url": server, "apiKey": apiKey }, `${platform}/networks`);
        });
    }
    /**
     * Retrieves a list of entities given a network, for example: 'block', 'operation', 'account'.
     *
     * @param server A fully qualified base URL for a Conseil server instance
     * @param apiKey Conseil API key
     * @param platform A platform
     * @param network Network of interest
     *
     * @see {@link getNetworks}
     */
    getEntities(server, apiKey, platform, network) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.executeMetadataQuery({ "url": server, "apiKey": apiKey }, `${platform}/${network}/entities`);
        });
    }
    /**
     * Retrieves a list of attributes for an entity.
     *
     * @param server A fully qualified base URL for a Conseil server instance
     * @param apiKey Conseil API key
     * @param platform A platform
     * @param network A network
     * @param entity Entity of interest
     *
     * @see {@link getEntities}
     */
    getAttributes(server, apiKey, platform, network, entity) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.executeMetadataQuery({ "url": server, "apiKey": apiKey }, `${platform}/${network}/${entity}/attributes`);
        });
    }
    /**
     * Retrieves a list of distinct values for a specific attribute of an entity. This would work on low-cardinality, generally non-date and non-numeric data. The intended use-case for this result set is type-ahead auto-complete.
     *
     * @param server A fully qualified base URL for a Conseil server instance
     * @param apiKey Conseil API key
     * @param platform A platform
     * @param network A network
     * @param entity An entity
     * @param attribute Attribute of interest
     *
     * @see {@link getAttributes}
     */
    getAttributeValues(server, apiKey, platform, network, entity, attribute) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.executeMetadataQuery({ "url": server, "apiKey": apiKey }, `${platform}/${network}/${entity}/${attribute}`);
        });
    }
}
exports.ConseilMetadataClient = ConseilMetadataClient;
//# sourceMappingURL=ConseilMetadataClient.js.map
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fetch_1 = __importDefault(require("node-fetch"));
var ConseilMetadataClient;
(function (ConseilMetadataClient) {
    function executeMetadataQuery(serverInfo, route) {
        return __awaiter(this, void 0, void 0, function* () {
            return node_fetch_1.default(`${serverInfo.url}/v2/metadata/${route}`, {
                method: 'GET',
                headers: { "apiKey": serverInfo.apiKey },
            }).then(response => { return response.json(); });
        });
    }
    ConseilMetadataClient.executeMetadataQuery = executeMetadataQuery;
    function getPlatforms(server, apiKey) {
        return __awaiter(this, void 0, void 0, function* () {
            return executeMetadataQuery({ "url": server, "apiKey": apiKey }, 'platforms');
        });
    }
    ConseilMetadataClient.getPlatforms = getPlatforms;
    function getNetworks(server, apiKey, platform) {
        return __awaiter(this, void 0, void 0, function* () {
            return executeMetadataQuery({ "url": server, "apiKey": apiKey }, `${platform}/networks`);
        });
    }
    ConseilMetadataClient.getNetworks = getNetworks;
    function getEntities(server, apiKey, platform, network) {
        return __awaiter(this, void 0, void 0, function* () {
            return executeMetadataQuery({ "url": server, "apiKey": apiKey }, `${platform}/${network}/entities`);
        });
    }
    ConseilMetadataClient.getEntities = getEntities;
    function getAttributes(server, apiKey, platform, network, entity) {
        return __awaiter(this, void 0, void 0, function* () {
            return executeMetadataQuery({ "url": server, "apiKey": apiKey }, `${platform}/${network}/${entity}/attributes`);
        });
    }
    ConseilMetadataClient.getAttributes = getAttributes;
    function getAttributeValues(server, apiKey, platform, network, entity, attribute) {
        return __awaiter(this, void 0, void 0, function* () {
            return executeMetadataQuery({ "url": server, "apiKey": apiKey }, `${platform}/${network}/${entity}/${attribute}`);
        });
    }
    ConseilMetadataClient.getAttributeValues = getAttributeValues;
})(ConseilMetadataClient = exports.ConseilMetadataClient || (exports.ConseilMetadataClient = {}));
//# sourceMappingURL=ConseilMetadataClient.js.map
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
const ErrorTypes_1 = require("../types/conseil/ErrorTypes");
const FetchSelector_1 = __importDefault(require("../utils/FetchSelector"));
const LoggerSelector_1 = __importDefault(require("../utils/LoggerSelector"));
const log = LoggerSelector_1.default.getLogger();
const fetch = FetchSelector_1.default.getFetch();
var ConseilMetadataClient;
(function (ConseilMetadataClient) {
    function executeMetadataQuery(serverInfo, route) {
        return __awaiter(this, void 0, void 0, function* () {
            return fetch(`${serverInfo.url}/v2/metadata/${route}`, {
                method: 'GET',
                headers: { 'apiKey': serverInfo.apiKey }
            })
                .then(r => {
                if (!r.ok) {
                    throw new ErrorTypes_1.ConseilRequestError(r.status, r.statusText, `${serverInfo.url}/v2/metadata/${route}`, null);
                }
                return r;
            })
                .then(r => r.json()
                .catch(error => {
                log.error(`ConseilMetadataClient.executeMetadataQuery parsing failed for ${serverInfo.url}/v2/metadata/${route} with ${error}`);
            }));
        });
    }
    ConseilMetadataClient.executeMetadataQuery = executeMetadataQuery;
    function getPlatforms(serverInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            return executeMetadataQuery(serverInfo, 'platforms');
        });
    }
    ConseilMetadataClient.getPlatforms = getPlatforms;
    function getNetworks(serverInfo, platform) {
        return __awaiter(this, void 0, void 0, function* () {
            return executeMetadataQuery(serverInfo, `${platform}/networks`);
        });
    }
    ConseilMetadataClient.getNetworks = getNetworks;
    function getEntities(serverInfo, platform, network) {
        return __awaiter(this, void 0, void 0, function* () {
            return executeMetadataQuery(serverInfo, `${platform}/${network}/entities`);
        });
    }
    ConseilMetadataClient.getEntities = getEntities;
    function getAttributes(serverInfo, platform, network, entity) {
        return __awaiter(this, void 0, void 0, function* () {
            return executeMetadataQuery(serverInfo, `${platform}/${network}/${entity}/attributes`);
        });
    }
    ConseilMetadataClient.getAttributes = getAttributes;
    function getAttributeValues(serverInfo, platform, network, entity, attribute) {
        return __awaiter(this, void 0, void 0, function* () {
            return executeMetadataQuery(serverInfo, `${platform}/${network}/${entity}/${attribute}`);
        });
    }
    ConseilMetadataClient.getAttributeValues = getAttributeValues;
    function getAttributeValuesForPrefix(serverInfo, platform, network, entity, attribute, prefix) {
        return __awaiter(this, void 0, void 0, function* () {
            return executeMetadataQuery(serverInfo, `${platform}/${network}/${entity}/${attribute}/${encodeURIComponent(prefix)}`);
        });
    }
    ConseilMetadataClient.getAttributeValuesForPrefix = getAttributeValuesForPrefix;
})(ConseilMetadataClient = exports.ConseilMetadataClient || (exports.ConseilMetadataClient = {}));
//# sourceMappingURL=ConseilMetadataClient.js.map
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
var ConseilDataClient;
(function (ConseilDataClient) {
    function executeEntityQuery(serverInfo, platform, network, entity, query) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = `${serverInfo.url}/v2/data/${platform}/${network}/${entity}`;
            log.debug(`ConseilDataClient.executeEntityQuery request: ${url}, ${JSON.stringify(query)}`);
            return fetch(url, {
                method: 'post',
                headers: { 'apiKey': serverInfo.apiKey, 'Content-Type': 'application/json' },
                body: JSON.stringify(query)
            })
                .then(r => {
                if (!r.ok) {
                    throw new ErrorTypes_1.ConseilRequestError(r.status, r.statusText, url, query);
                }
                return r;
            })
                .then(r => {
                const isJSONResponse = r.headers.get('content-type').toLowerCase().includes('application/json');
                const response = isJSONResponse ? r.json() : r.text();
                log.debug(`ConseilDataClient.executeEntityQuery response: ${isJSONResponse ? JSON.stringify(response) : response}`);
                return response;
            });
        });
    }
    ConseilDataClient.executeEntityQuery = executeEntityQuery;
})(ConseilDataClient = exports.ConseilDataClient || (exports.ConseilDataClient = {}));
//# sourceMappingURL=ConseilDataClient.js.map
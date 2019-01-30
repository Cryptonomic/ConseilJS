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
var ConseilDataClient;
(function (ConseilDataClient) {
    function executeEntityQuery(serverInfo, platform, network, entity, query) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('url===', `${serverInfo.url}/v2/data/${platform}/${network}/${entity}`);
            console.log('apikey===', serverInfo.apiKey);
            console.log('body ==== ', JSON.stringify(query));
            return fetch(`${serverInfo.url}/v2/data/${platform}/${network}/${entity}`, {
                method: 'POST',
                headers: { "apiKey": serverInfo.apiKey },
                body: JSON.stringify(query)
            }).then(response => { return response.json(); });
        });
    }
    ConseilDataClient.executeEntityQuery = executeEntityQuery;
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
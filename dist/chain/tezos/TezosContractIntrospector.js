"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const TezosConseilClient_1 = require("../../reporting/tezos/TezosConseilClient");
const TezosChainTypes_1 = require("../../types/tezos/TezosChainTypes");
const EntryPointTemplate = __importStar(require("./lexer/EntryPointTemplate"));
const nearley = __importStar(require("nearley"));
var TezosContractIntrospector;
(function (TezosContractIntrospector) {
    function generateEntryPointsFromCode(contractCode, parameterFormat = TezosChainTypes_1.TezosParameterFormat.Michelson) {
        return __awaiter(this, void 0, void 0, function* () {
            const contractParameter = retrieveParameter(contractCode);
            const parser = new nearley.Parser(nearley.Grammar.fromCompiled(EntryPointTemplate));
            parser.feed(contractParameter);
            return parser.results[0];
        });
    }
    TezosContractIntrospector.generateEntryPointsFromCode = generateEntryPointsFromCode;
    function generateEntryPointsFromAddress(conseilServer, network, contractAddress, parameterFormat = TezosChainTypes_1.TezosParameterFormat.Michelson) {
        return __awaiter(this, void 0, void 0, function* () {
            const account = yield TezosConseilClient_1.TezosConseilClient.getAccount(conseilServer, network, contractAddress);
            const contractCode = account[0].script;
            return generateEntryPointsFromCode(contractCode);
        });
    }
    TezosContractIntrospector.generateEntryPointsFromAddress = generateEntryPointsFromAddress;
    function retrieveParameter(contractCode) {
        const parameterStartIndex = contractCode.indexOf('parameter');
        const parameterEndIndex = contractCode.indexOf(';', parameterStartIndex) + 1;
        return contractCode.substring(parameterStartIndex, parameterEndIndex).replace(/\s+/gm, ' ');
    }
})(TezosContractIntrospector = exports.TezosContractIntrospector || (exports.TezosContractIntrospector = {}));
//# sourceMappingURL=TezosContractIntrospector.js.map
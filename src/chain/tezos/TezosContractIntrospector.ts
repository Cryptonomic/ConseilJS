import { TezosConseilClient } from '../../reporting/tezos/TezosConseilClient';
import { TezosParameterFormat } from '../../types/tezos/TezosChainTypes';
import { ConseilServerInfo } from '../../types/conseil/QueryTypes';
import * as EntrypointTemplate from './lexer/EntrypointTemplate';
import * as nearley from 'nearley';

export namespace TezosContractIntrospector {
    export async function generateEntrypoints(contractCode: string) {
        const parser: any = new nearley.Parser(nearley.Grammar.fromCompiled(EntrypointTemplate));
        parser.feed(contractCode);
        const parserResult = parser.results[0];
        console.log(parserResult);
        return parserResult;
    }

    async function retrieveParameter(contractAddress: string, conseilServer: ConseilServerInfo, network: string): Promise<string> {
        const account: any[] = await TezosConseilClient.getAccount(conseilServer, network, contractAddress);
        console.log(account[0])
        return account[0].script;
    }
}

TezosTypes.TezosParameterFormat = TezosTypes.TezosParameterFormat.Micheline
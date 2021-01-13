import { JSONPath } from 'jsonpath-plus';

import {KeyStore, Signer} from '../../../../types/ExternalInterfaces';
import {TezosNodeWriter} from '../../TezosNodeWriter';
import {TezosParameterFormat} from '../../../../types/tezos/TezosChainTypes';
import {TezosNodeReader} from '../../TezosNodeReader';

    export interface Storage {
        admin: string;
        paused: boolean;
        balanceMap: number;
        operatorMap: number;
        metadataMap: number;
    }

    // deploy parameters
    export interface DeployPair {
        admin: string;
        all_tokens: string; // = '0';
        ledger: string; // = '[]';
        metadata_string: string; // = 'Unit';
        operators: string; // = '[]';
        paused: boolean; // = false;
        tokens: string; // = '[]';
    }

    export const EmptyDeployment: DeployPair = {
        admin: '',
        all_tokens: '0',
        ledger: '[]',
        metadata_string: 'Unit',
        operators: '[]',
        paused: false,
        tokens: '[]'
    };

    // mint
    export interface MintPair {
        address: string;
        amount: number;
        sym: string;
        token_id: number;
    }

    // burn
    export interface BurnPair {
        address: string;
        amount: number;
        token_id: number;
    }

export namespace FA2Helper {
    export async function Deploy(server: string, signer: Signer, keystore: KeyStore, amount: number, fee: number, deploy: DeployPair, gas: number, freight: number): Promise<string> {
        const code = `[
            {"prim":"storage","args":[{"prim":"pair","args":[{"prim":"pair","args":[{"prim":"address","annots":["%administrator"]},{"prim":"pair","args":[{"prim":"nat","annots":["%all_tokens"]},{"prim":"big_map","args":[{"prim":"address"},{"prim":"nat"}],"annots":["%ledger"]}]}]},{"prim":"pair","args":[{"prim":"pair","args":[{"prim":"unit","annots":["%metadata_string"]},{"prim":"big_map","args":[{"prim":"pair","args":[{"prim":"address","annots":["%owner"]},{"prim":"pair","args":[{"prim":"address","annots":["%operator"]},{"prim":"nat","annots":["%token_id"]}]}]},{"prim":"unit"}],"annots":["%operators"]}]},{"prim":"pair","args":[{"prim":"bool","annots":["%paused"]},{"prim":"big_map","args":[{"prim":"nat"},{"prim":"pair","args":[{"prim":"nat","annots":["%token_id"]},{"prim":"pair","args":[{"prim":"string","annots":["%symbol"]},{"prim":"pair","args":[{"prim":"string","annots":["%name"]},{"prim":"pair","args":[{"prim":"nat","annots":["%decimals"]},{"prim":"map","args":[{"prim":"string"},{"prim":"string"}],"annots":["%extras"]}]}]}]}]}],"annots":["%tokens"]}]}]}]}]},
            {"prim":"parameter","args":[{"prim":"or","args":[{"prim":"or","args":[{"prim":"or","args":[{"prim":"pair","args":[{"prim":"list","args":[{"prim":"pair","args":[{"prim":"address","annots":["%owner"]},{"prim":"nat","annots":["%token_id"]}]}],"annots":["%requests"]},{"prim":"contract","args":[{"prim":"list","args":[{"prim":"pair","args":[{"prim":"pair","args":[{"prim":"address","annots":["%owner"]},{"prim":"nat","annots":["%token_id"]}],"annots":["%request"]},{"prim":"nat","annots":["%balance"]}]}]}],"annots":["%callback"]}],"annots":["%balance_of"]},{"prim":"list","args":[{"prim":"pair","args":[{"prim":"address","annots":["%address"]},{"prim":"pair","args":[{"prim":"nat","annots":["%amount"]},{"prim":"nat","annots":["%token_id"]}]}]}],"annots":["%burn"]}]},{"prim":"or","args":[{"prim":"list","args":[{"prim":"pair","args":[{"prim":"pair","args":[{"prim":"address","annots":["%address"]},{"prim":"nat","annots":["%amount"]}]},{"prim":"pair","args":[{"prim":"string","annots":["%symbol"]},{"prim":"nat","annots":["%token_id"]}]}]}],"annots":["%mint"]},{"prim":"address","annots":["%set_administrator"]}]}]},{"prim":"or","args":[{"prim":"or","args":[{"prim":"bool","annots":["%set_pause"]},{"prim":"pair","args":[{"prim":"list","args":[{"prim":"nat"}],"annots":["%token_ids"]},{"prim":"lambda","args":[{"prim":"list","args":[{"prim":"pair","args":[{"prim":"nat","annots":["%token_id"]},{"prim":"pair","args":[{"prim":"string","annots":["%symbol"]},{"prim":"pair","args":[{"prim":"string","annots":["%name"]},{"prim":"pair","args":[{"prim":"nat","annots":["%decimals"]},{"prim":"map","args":[{"prim":"string"},{"prim":"string"}],"annots":["%extras"]}]}]}]}]}]},{"prim":"unit"}],"annots":["%handler"]}],"annots":["%token_metadata"]}]},{"prim":"or","args":[{"prim":"contract","args":[{"prim":"address"}],"annots":["%token_metadata_registry"]},{"prim":"or","args":[{"prim":"list","args":[{"prim":"pair","args":[{"prim":"address","annots":["%from_"]},{"prim":"list","args":[{"prim":"pair","args":[{"prim":"address","annots":["%to_"]},{"prim":"pair","args":[{"prim":"nat","annots":["%token_id"]},{"prim":"nat","annots":["%amount"]}]}]}],"annots":["%txs"]}]}],"annots":["%transfer"]},{"prim":"list","args":[{"prim":"or","args":[{"prim":"pair","args":[{"prim":"address","annots":["%owner"]},{"prim":"pair","args":[{"prim":"address","annots":["%operator"]},{"prim":"nat","annots":["%token_id"]}]}],"annots":["%add_operator"]},{"prim":"pair","args":[{"prim":"address","annots":["%owner"]},{"prim":"pair","args":[{"prim":"address","annots":["%operator"]},{"prim":"nat","annots":["%token_id"]}]}],"annots":["%remove_operator"]}]}],"annots":["%update_operators"]}]}]}]}]}]},
            {"prim":"code","args":[[{"prim":"DUP"},{"prim":"CDR"},{"prim":"SWAP"},{"prim":"CAR"},{"prim":"IF_LEFT","args":[[{"prim":"IF_LEFT","args":[[{"prim":"IF_LEFT","args":[[{"prim":"SWAP"},{"prim":"DUP"},{"prim":"DUG","args":[{"int":"2"}]},{"prim":"CDR"},{"prim":"CDR"},{"prim":"CAR"},{"prim":"IF","args":[[{"prim":"PUSH","args":[{"prim":"int"},{"int":"481"}]},{"prim":"FAILWITH"}],[]]},{"prim":"DUP"},{"prim":"CAR"},{"prim":"MAP","args":[[{"prim":"DIG","args":[{"int":"2"}]},{"prim":"DUP"},{"prim":"DUG","args":[{"int":"3"}]},{"prim":"CDR"},{"prim":"CDR"},{"prim":"CDR"},{"prim":"SWAP"},{"prim":"DUP"},{"prim":"DUG","args":[{"int":"2"}]},{"prim":"CDR"},{"prim":"MEM"},{"prim":"IF","args":[[],[{"prim":"PUSH","args":[{"prim":"string"},{"string":"FA2_TOKEN_UNDEFINED"}]},{"prim":"FAILWITH"}]]},{"prim":"DIG","args":[{"int":"2"}]},{"prim":"DUP"},{"prim":"DUG","args":[{"int":"3"}]},{"prim":"CAR"},{"prim":"CDR"},{"prim":"CDR"},{"prim":"SWAP"},{"prim":"DUP"},{"prim":"DUG","args":[{"int":"2"}]},{"prim":"CAR"},{"prim":"MEM"},{"prim":"IF","args":[[{"prim":"DIG","args":[{"int":"2"}]},{"prim":"DUP"},{"prim":"DUG","args":[{"int":"3"}]},{"prim":"CAR"},{"prim":"CDR"},{"prim":"CDR"},{"prim":"SWAP"},{"prim":"DUP"},{"prim":"DUG","args":[{"int":"2"}]},{"prim":"CAR"},{"prim":"GET"},{"prim":"IF_NONE","args":[[{"prim":"PUSH","args":[{"prim":"int"},{"int":"488"}]},{"prim":"FAILWITH"}],[]]},{"prim":"SWAP"},{"prim":"DUP"},{"prim":"CDR"},{"prim":"SWAP"},{"prim":"CAR"},{"prim":"PAIR","annots":["%owner","%token_id"]},{"prim":"PAIR","annots":["%request","%balance"]}],[{"prim":"PUSH","args":[{"prim":"nat"},{"int":"0"}]},{"prim":"SWAP"},{"prim":"DUP"},{"prim":"CDR"},{"prim":"SWAP"},{"prim":"CAR"},{"prim":"PAIR","annots":["%owner","%token_id"]},{"prim":"PAIR","annots":["%request","%balance"]}]]}]]},{"prim":"NIL","args":[{"prim":"operation"}]},{"prim":"DIG","args":[{"int":"2"}]},{"prim":"CDR"},{"prim":"PUSH","args":[{"prim":"mutez"},{"int":"0"}]},{"prim":"DIG","args":[{"int":"3"}]},{"prim":"TRANSFER_TOKENS"},{"prim":"CONS"}],[{"prim":"SWAP"},{"prim":"DUP"},{"prim":"DUG","args":[{"int":"2"}]},{"prim":"CAR"},{"prim":"CAR"},{"prim":"SENDER"},{"prim":"COMPARE"},{"prim":"EQ"},{"prim":"IF","args":[[],[{"prim":"PUSH","args":[{"prim":"int"},{"int":"598"}]},{"prim":"FAILWITH"}]]},{"prim":"DUP"},{"prim":"ITER","args":[[{"prim":"DUP"},{"prim":"CDR"},{"prim":"CDR"},{"prim":"PUSH","args":[{"prim":"nat"},{"int":"0"}]},{"prim":"COMPARE"},{"prim":"EQ"},{"prim":"IF","args":[[],[{"prim":"PUSH","args":[{"prim":"string"},{"string":"single-asset: token-id <> 0"}]},{"prim":"FAILWITH"}]]},{"prim":"DIG","args":[{"int":"2"}]},{"prim":"DUP"},{"prim":"DUG","args":[{"int":"3"}]},{"prim":"CAR"},{"prim":"CDR"},{"prim":"CAR"},{"prim":"SWAP"},{"prim":"DUP"},{"prim":"DUG","args":[{"int":"2"}]},{"prim":"CDR"},{"prim":"CDR"},{"prim":"COMPARE"},{"prim":"LT"},{"prim":"IF","args":[[],[{"prim":"PUSH","args":[{"prim":"string"},{"string":"cannot burn a token that does not exist"}]},{"prim":"FAILWITH"}]]},{"prim":"DIG","args":[{"int":"2"}]},{"prim":"DUP"},{"prim":"DUG","args":[{"int":"3"}]},{"prim":"CAR"},{"prim":"CDR"},{"prim":"CDR"},{"prim":"SWAP"},{"prim":"DUP"},{"prim":"DUG","args":[{"int":"2"}]},{"prim":"CAR"},{"prim":"MEM"},{"prim":"IF","args":[[{"prim":"DUP"},{"prim":"CDR"},{"prim":"CAR"},{"prim":"DIG","args":[{"int":"3"}]},{"prim":"DUP"},{"prim":"DUG","args":[{"int":"4"}]},{"prim":"CAR"},{"prim":"CDR"},{"prim":"CDR"},{"prim":"DIG","args":[{"int":"2"}]},{"prim":"DUP"},{"prim":"DUG","args":[{"int":"3"}]},{"prim":"CAR"},{"prim":"GET"},{"prim":"IF_NONE","args":[[{"prim":"PUSH","args":[{"prim":"int"},{"int":"610"}]},{"prim":"FAILWITH"}],[]]},{"prim":"COMPARE"},{"prim":"GE"}],[{"prim":"PUSH","args":[{"prim":"bool"},{"prim":"False"}]}]]},{"prim":"IF","args":[[],[{"prim":"PUSH","args":[{"prim":"string"},{"string":"user does not have sufficient balance to burn"}]},{"prim":"FAILWITH"}]]},{"prim":"DIG","args":[{"int":"2"}]},{"prim":"DUP"},{"prim":"DUG","args":[{"int":"3"}]},{"prim":"DUP"},{"prim":"CDR"},{"prim":"SWAP"},{"prim":"CAR"},{"prim":"DUP"},{"prim":"CAR"},{"prim":"SWAP"},{"prim":"CDR"},{"prim":"DUP"},{"prim":"CAR"},{"prim":"SWAP"},{"prim":"CDR"},{"prim":"DUP"},{"prim":"DIG","args":[{"int":"5"}]},{"prim":"DUP"},{"prim":"DUG","args":[{"int":"6"}]},{"prim":"CAR"},{"prim":"DUP"},{"prim":"DUG","args":[{"int":"2"}]},{"prim":"GET"},{"prim":"IF_NONE","args":[[{"prim":"PUSH","args":[{"prim":"int"},{"int":"612"}]},{"prim":"FAILWITH"}],[{"prim":"DROP"}]]},{"prim":"DIG","args":[{"int":"5"}]},{"prim":"DUP"},{"prim":"DUG","args":[{"int":"6"}]},{"prim":"CDR"},{"prim":"CAR"},{"prim":"DIG","args":[{"int":"8"}]},{"prim":"CAR"},{"prim":"CDR"},{"prim":"CDR"},{"prim":"DIG","args":[{"int":"7"}]},{"prim":"CAR"},{"prim":"GET"},{"prim":"IF_NONE","args":[[{"prim":"PUSH","args":[{"prim":"int"},{"int":"613"}]},{"prim":"FAILWITH"}],[]]},{"prim":"SUB"},{"prim":"ISNAT"},{"prim":"IF_NONE","args":[[{"prim":"PUSH","args":[{"prim":"int"},{"int":"612"}]},{"prim":"FAILWITH"}],[]]},{"prim":"SOME"},{"prim":"SWAP"},{"prim":"UPDATE"},{"prim":"SWAP"},{"prim":"PAIR"},{"prim":"SWAP"},{"prim":"PAIR"},{"prim":"PAIR"},{"prim":"SWAP"}]]},{"prim":"DROP"},{"prim":"NIL","args":[{"prim":"operation"}]}]]}],[{"prim":"IF_LEFT","args":[[{"prim":"SWAP"},{"prim":"DUP"},{"prim":"DUG","args":[{"int":"2"}]},{"prim":"CAR"},{"prim":"CAR"},{"prim":"SENDER"},{"prim":"COMPARE"},{"prim":"EQ"},{"prim":"IF","args":[[],[{"prim":"PUSH","args":[{"prim":"int"},{"int":"568"}]},{"prim":"FAILWITH"}]]},{"prim":"DUP"},{"prim":"ITER","args":[[{"prim":"DUP"},{"prim":"CDR"},{"prim":"CDR"},{"prim":"PUSH","args":[{"prim":"nat"},{"int":"0"}]},{"prim":"COMPARE"},{"prim":"EQ"},{"prim":"IF","args":[[],[{"prim":"PUSH","args":[{"prim":"string"},{"string":"single-asset: token-id <> 0"}]},{"prim":"FAILWITH"}]]},{"prim":"DIG","args":[{"int":"2"}]},{"prim":"DUP"},{"prim":"DUG","args":[{"int":"3"}]},{"prim":"DUP"},{"prim":"CDR"},{"prim":"SWAP"},{"prim":"CAR"},{"prim":"DUP"},{"prim":"CAR"},{"prim":"SWAP"},{"prim":"CDR"},{"prim":"CDR"},{"prim":"DIG","args":[{"int":"5"}]},{"prim":"CAR"},{"prim":"CDR"},{"prim":"CAR"},{"prim":"DUP"},{"prim":"PUSH","args":[{"prim":"nat"},{"int":"1"}]},{"prim":"DIG","args":[{"int":"6"}]},{"prim":"DUP"},{"prim":"DUG","args":[{"int":"7"}]},{"prim":"CDR"},{"prim":"CDR"},{"prim":"ADD"},{"prim":"DUP"},{"prim":"DUG","args":[{"int":"2"}]},{"prim":"COMPARE"},{"prim":"LE"},{"prim":"IF","args":[[{"prim":"DROP"}],[{"prim":"SWAP"},{"prim":"DROP"}]]},{"prim":"PAIR"},{"prim":"SWAP"},{"prim":"PAIR"},{"prim":"PAIR"},{"prim":"DUP"},{"prim":"DUG","args":[{"int":"3"}]},{"prim":"CAR"},{"prim":"CDR"},{"prim":"CDR"},{"prim":"SWAP"},{"prim":"DUP"},{"prim":"DUG","args":[{"int":"2"}]},{"prim":"CAR"},{"prim":"CAR"},{"prim":"MEM"},{"prim":"IF","args":[[{"prim":"DIG","args":[{"int":"2"}]},{"prim":"DUP"},{"prim":"CDR"},{"prim":"SWAP"},{"prim":"CAR"},{"prim":"DUP"},{"prim":"CAR"},{"prim":"SWAP"},{"prim":"CDR"},{"prim":"DUP"},{"prim":"CAR"},{"prim":"SWAP"},{"prim":"CDR"},{"prim":"DUP"},{"prim":"DIG","args":[{"int":"5"}]},{"prim":"DUP"},{"prim":"DUG","args":[{"int":"6"}]},{"prim":"CAR"},{"prim":"CAR"},{"prim":"DUP"},{"prim":"DUG","args":[{"int":"2"}]},{"prim":"GET"},{"prim":"IF_NONE","args":[[{"prim":"PUSH","args":[{"prim":"int"},{"int":"581"}]},{"prim":"FAILWITH"}],[]]},{"prim":"DIG","args":[{"int":"6"}]},{"prim":"DUP"},{"prim":"DUG","args":[{"int":"7"}]},{"prim":"CAR"},{"prim":"CDR"},{"prim":"ADD"},{"prim":"SOME"},{"prim":"SWAP"},{"prim":"UPDATE"},{"prim":"SWAP"},{"prim":"PAIR"},{"prim":"SWAP"},{"prim":"PAIR"},{"prim":"PAIR"},{"prim":"DUG","args":[{"int":"2"}]}],[{"prim":"DIG","args":[{"int":"2"}]},{"prim":"DUP"},{"prim":"CDR"},{"prim":"SWAP"},{"prim":"CAR"},{"prim":"DUP"},{"prim":"CAR"},{"prim":"SWAP"},{"prim":"CDR"},{"prim":"DUP"},{"prim":"CAR"},{"prim":"SWAP"},{"prim":"CDR"},{"prim":"DIG","args":[{"int":"4"}]},{"prim":"DUP"},{"prim":"CAR"},{"prim":"CAR"},{"prim":"SWAP"},{"prim":"DUP"},{"prim":"DUG","args":[{"int":"6"}]},{"prim":"CAR"},{"prim":"CDR"},{"prim":"SOME"},{"prim":"SWAP"},{"prim":"UPDATE"},{"prim":"SWAP"},{"prim":"PAIR"},{"prim":"SWAP"},{"prim":"PAIR"},{"prim":"PAIR"},{"prim":"DUG","args":[{"int":"2"}]}]]},{"prim":"DIG","args":[{"int":"2"}]},{"prim":"DUP"},{"prim":"DUG","args":[{"int":"3"}]},{"prim":"CDR"},{"prim":"CDR"},{"prim":"CDR"},{"prim":"SWAP"},{"prim":"DUP"},{"prim":"DUG","args":[{"int":"2"}]},{"prim":"CDR"},{"prim":"CDR"},{"prim":"MEM"},{"prim":"IF","args":[[{"prim":"DROP"}],[{"prim":"DIG","args":[{"int":"2"}]},{"prim":"DUP"},{"prim":"CAR"},{"prim":"SWAP"},{"prim":"CDR"},{"prim":"DUP"},{"prim":"CAR"},{"prim":"SWAP"},{"prim":"CDR"},{"prim":"DUP"},{"prim":"CAR"},{"prim":"SWAP"},{"prim":"CDR"},{"prim":"DIG","args":[{"int":"4"}]},{"prim":"DUP"},{"prim":"DUG","args":[{"int":"5"}]},{"prim":"CDR"},{"prim":"CDR"},{"prim":"PUSH","args":[{"prim":"pair","args":[{"prim":"string","annots":["%name"]},{"prim":"pair","args":[{"prim":"nat","annots":["%decimals"]},{"prim":"map","args":[{"prim":"string"},{"prim":"string"}],"annots":["%extras"]}]}]},{"prim":"Pair","args":[{"string":""},{"prim":"Pair","args":[{"int":"0"},[]]}]}]},{"prim":"DIG","args":[{"int":"6"}]},{"prim":"DUP"},{"prim":"DUG","args":[{"int":"7"}]},{"prim":"CDR"},{"prim":"CAR"},{"prim":"PAIR","annots":["%symbol"]},{"prim":"DIG","args":[{"int":"6"}]},{"prim":"CDR"},{"prim":"CDR"},{"prim":"PAIR","annots":["%token_id"]},{"prim":"SOME"},{"prim":"SWAP"},{"prim":"UPDATE"},{"prim":"SWAP"},{"prim":"PAIR"},{"prim":"SWAP"},{"prim":"PAIR"},{"prim":"SWAP"},{"prim":"PAIR"},{"prim":"SWAP"}]]}]]},{"prim":"DROP"}],[{"prim":"SWAP"},{"prim":"DUP"},{"prim":"DUG","args":[{"int":"2"}]},{"prim":"CAR"},{"prim":"CAR"},{"prim":"SENDER"},{"prim":"COMPARE"},{"prim":"EQ"},{"prim":"IF","args":[[],[{"prim":"PUSH","args":[{"prim":"int"},{"int":"553"}]},{"prim":"FAILWITH"}]]},{"prim":"SWAP"},{"prim":"DUP"},{"prim":"CDR"},{"prim":"SWAP"},{"prim":"CAR"},{"prim":"CDR"},{"prim":"DIG","args":[{"int":"2"}]},{"prim":"PAIR"},{"prim":"PAIR"}]]},{"prim":"NIL","args":[{"prim":"operation"}]}]]}],[{"prim":"IF_LEFT","args":[[{"prim":"IF_LEFT","args":[[{"prim":"SWAP"},{"prim":"DUP"},{"prim":"DUG","args":[{"int":"2"}]},{"prim":"CAR"},{"prim":"CAR"},{"prim":"SENDER"},{"prim":"COMPARE"},{"prim":"EQ"},{"prim":"IF","args":[[],[{"prim":"PUSH","args":[{"prim":"int"},{"int":"562"}]},{"prim":"FAILWITH"}]]},{"prim":"SWAP"},{"prim":"DUP"},{"prim":"CAR"},{"prim":"SWAP"},{"prim":"CDR"},{"prim":"DUP"},{"prim":"CAR"},{"prim":"SWAP"},{"prim":"CDR"},{"prim":"CDR"},{"prim":"DIG","args":[{"int":"3"}]},{"prim":"PAIR"},{"prim":"SWAP"},{"prim":"PAIR"},{"prim":"SWAP"},{"prim":"PAIR"}],[{"prim":"SWAP"},{"prim":"DUP"},{"prim":"DUG","args":[{"int":"2"}]},{"prim":"CDR"},{"prim":"CDR"},{"prim":"CAR"},{"prim":"IF","args":[[{"prim":"PUSH","args":[{"prim":"int"},{"int":"619"}]},{"prim":"FAILWITH"}],[]]},{"prim":"DUP"},{"prim":"CDR"},{"prim":"SWAP"},{"prim":"DUP"},{"prim":"DUG","args":[{"int":"2"}]},{"prim":"CAR"},{"prim":"MAP","args":[[{"prim":"DIG","args":[{"int":"3"}]},{"prim":"DUP"},{"prim":"DUG","args":[{"int":"4"}]},{"prim":"CDR"},{"prim":"CDR"},{"prim":"CDR"},{"prim":"SWAP"},{"prim":"GET"},{"prim":"IF_NONE","args":[[{"prim":"PUSH","args":[{"prim":"int"},{"int":"629"}]},{"prim":"FAILWITH"}],[]]}]]},{"prim":"EXEC"},{"prim":"DROP","args":[{"int":"2"}]}]]},{"prim":"NIL","args":[{"prim":"operation"}]}],[{"prim":"IF_LEFT","args":[[{"prim":"SWAP"},{"prim":"DUP"},{"prim":"DUG","args":[{"int":"2"}]},{"prim":"CDR"},{"prim":"CDR"},{"prim":"CAR"},{"prim":"IF","args":[[{"prim":"PUSH","args":[{"prim":"int"},{"int":"509"}]},{"prim":"FAILWITH"}],[]]},{"prim":"NIL","args":[{"prim":"operation"}]},{"prim":"SWAP"},{"prim":"PUSH","args":[{"prim":"mutez"},{"int":"0"}]},{"prim":"SELF"},{"prim":"ADDRESS"},{"prim":"TRANSFER_TOKENS"},{"prim":"CONS"}],[{"prim":"IF_LEFT","args":[[{"prim":"SWAP"},{"prim":"DUP"},{"prim":"DUG","args":[{"int":"2"}]},{"prim":"CDR"},{"prim":"CDR"},{"prim":"CAR"},{"prim":"IF","args":[[{"prim":"PUSH","args":[{"prim":"int"},{"int":"438"}]},{"prim":"FAILWITH"}],[]]},{"prim":"DUP"},{"prim":"ITER","args":[[{"prim":"DUP"},{"prim":"CDR"},{"prim":"ITER","args":[[{"prim":"DUP"},{"prim":"CDR"},{"prim":"CAR"},{"prim":"PUSH","args":[{"prim":"nat"},{"int":"0"}]},{"prim":"COMPARE"},{"prim":"EQ"},{"prim":"IF","args":[[],[{"prim":"PUSH","args":[{"prim":"string"},{"string":"single-asset: token-id <> 0"}]},{"prim":"FAILWITH"}]]},{"prim":"DIG","args":[{"int":"3"}]},{"prim":"DUP"},{"prim":"DUG","args":[{"int":"4"}]},{"prim":"CAR"},{"prim":"CAR"},{"prim":"SENDER"},{"prim":"COMPARE"},{"prim":"EQ"},{"prim":"IF","args":[[{"prim":"PUSH","args":[{"prim":"bool"},{"prim":"True"}]}],[{"prim":"SENDER"},{"prim":"DIG","args":[{"int":"2"}]},{"prim":"DUP"},{"prim":"DUG","args":[{"int":"3"}]},{"prim":"CAR"},{"prim":"COMPARE"},{"prim":"EQ"}]]},{"prim":"IF","args":[[{"prim":"PUSH","args":[{"prim":"bool"},{"prim":"True"}]}],[{"prim":"DIG","args":[{"int":"3"}]},{"prim":"DUP"},{"prim":"DUG","args":[{"int":"4"}]},{"prim":"CDR"},{"prim":"CAR"},{"prim":"CDR"},{"prim":"SWAP"},{"prim":"DUP"},{"prim":"DUG","args":[{"int":"2"}]},{"prim":"CDR"},{"prim":"CAR"},{"prim":"SENDER"},{"prim":"PAIR","annots":["%operator","%token_id"]},{"prim":"DIG","args":[{"int":"3"}]},{"prim":"DUP"},{"prim":"DUG","args":[{"int":"4"}]},{"prim":"CAR"},{"prim":"PAIR","annots":["%owner"]},{"prim":"MEM"}]]},{"prim":"IF","args":[[],[{"prim":"PUSH","args":[{"prim":"string"},{"string":"FA2_NOT_OPERATOR"}]},{"prim":"FAILWITH"}]]},{"prim":"DIG","args":[{"int":"3"}]},{"prim":"DUP"},{"prim":"DUG","args":[{"int":"4"}]},{"prim":"CDR"},{"prim":"CDR"},{"prim":"CDR"},{"prim":"SWAP"},{"prim":"DUP"},{"prim":"DUG","args":[{"int":"2"}]},{"prim":"CDR"},{"prim":"CAR"},{"prim":"MEM"},{"prim":"IF","args":[[],[{"prim":"PUSH","args":[{"prim":"string"},{"string":"FA2_TOKEN_UNDEFINED"}]},{"prim":"FAILWITH"}]]},{"prim":"DUP"},{"prim":"CDR"},{"prim":"CDR"},{"prim":"PUSH","args":[{"prim":"nat"},{"int":"0"}]},{"prim":"COMPARE"},{"prim":"LT"},{"prim":"IF","args":[[{"prim":"DUP"},{"prim":"CDR"},{"prim":"CDR"},{"prim":"DIG","args":[{"int":"4"}]},{"prim":"DUP"},{"prim":"DUG","args":[{"int":"5"}]},{"prim":"CAR"},{"prim":"CDR"},{"prim":"CDR"},{"prim":"DIG","args":[{"int":"3"}]},{"prim":"DUP"},{"prim":"DUG","args":[{"int":"4"}]},{"prim":"CAR"},{"prim":"GET"},{"prim":"IF_NONE","args":[[{"prim":"PUSH","args":[{"prim":"int"},{"int":"466"}]},{"prim":"FAILWITH"}],[]]},{"prim":"COMPARE"},{"prim":"GE"},{"prim":"IF","args":[[],[{"prim":"PUSH","args":[{"prim":"string"},{"string":"FA2_INSUFFICIENT_BALANCE"}]},{"prim":"FAILWITH"}]]},{"prim":"DIG","args":[{"int":"3"}]},{"prim":"DUP"},{"prim":"DUG","args":[{"int":"4"}]},{"prim":"DUP"},{"prim":"CDR"},{"prim":"SWAP"},{"prim":"CAR"},{"prim":"DUP"},{"prim":"CAR"},{"prim":"SWAP"},{"prim":"CDR"},{"prim":"DUP"},{"prim":"CAR"},{"prim":"SWAP"},{"prim":"CDR"},{"prim":"DUP"},{"prim":"DIG","args":[{"int":"6"}]},{"prim":"DUP"},{"prim":"DUG","args":[{"int":"7"}]},{"prim":"CAR"},{"prim":"DUP"},{"prim":"DUG","args":[{"int":"2"}]},{"prim":"GET"},{"prim":"IF_NONE","args":[[{"prim":"PUSH","args":[{"prim":"int"},{"int":"469"}]},{"prim":"FAILWITH"}],[{"prim":"DROP"}]]},{"prim":"DIG","args":[{"int":"5"}]},{"prim":"DUP"},{"prim":"DUG","args":[{"int":"6"}]},{"prim":"CDR"},{"prim":"CDR"},{"prim":"DIG","args":[{"int":"9"}]},{"prim":"CAR"},{"prim":"CDR"},{"prim":"CDR"},{"prim":"DIG","args":[{"int":"8"}]},{"prim":"DUP"},{"prim":"DUG","args":[{"int":"9"}]},{"prim":"CAR"},{"prim":"GET"},{"prim":"IF_NONE","args":[[{"prim":"PUSH","args":[{"prim":"int"},{"int":"470"}]},{"prim":"FAILWITH"}],[]]},{"prim":"SUB"},{"prim":"ISNAT"},{"prim":"IF_NONE","args":[[{"prim":"PUSH","args":[{"prim":"int"},{"int":"469"}]},{"prim":"FAILWITH"}],[]]},{"prim":"SOME"},{"prim":"SWAP"},{"prim":"UPDATE"},{"prim":"SWAP"},{"prim":"PAIR"},{"prim":"SWAP"},{"prim":"PAIR"},{"prim":"PAIR"},{"prim":"DUP"},{"prim":"DUG","args":[{"int":"4"}]},{"prim":"CAR"},{"prim":"CDR"},{"prim":"CDR"},{"prim":"SWAP"},{"prim":"DUP"},{"prim":"DUG","args":[{"int":"2"}]},{"prim":"CAR"},{"prim":"MEM"},{"prim":"IF","args":[[{"prim":"DIG","args":[{"int":"3"}]},{"prim":"DUP"},{"prim":"CDR"},{"prim":"SWAP"},{"prim":"CAR"},{"prim":"DUP"},{"prim":"CAR"},{"prim":"SWAP"},{"prim":"CDR"},{"prim":"DUP"},{"prim":"CAR"},{"prim":"SWAP"},{"prim":"CDR"},{"prim":"DUP"},{"prim":"DIG","args":[{"int":"5"}]},{"prim":"DUP"},{"prim":"DUG","args":[{"int":"6"}]},{"prim":"CAR"},{"prim":"DUP"},{"prim":"DUG","args":[{"int":"2"}]},{"prim":"GET"},{"prim":"IF_NONE","args":[[{"prim":"PUSH","args":[{"prim":"int"},{"int":"472"}]},{"prim":"FAILWITH"}],[]]},{"prim":"DIG","args":[{"int":"6"}]},{"prim":"CDR"},{"prim":"CDR"},{"prim":"ADD"},{"prim":"SOME"},{"prim":"SWAP"},{"prim":"UPDATE"},{"prim":"SWAP"},{"prim":"PAIR"},{"prim":"SWAP"},{"prim":"PAIR"},{"prim":"PAIR"},{"prim":"DUG","args":[{"int":"2"}]}],[{"prim":"DIG","args":[{"int":"3"}]},{"prim":"DUP"},{"prim":"CDR"},{"prim":"SWAP"},{"prim":"CAR"},{"prim":"DUP"},{"prim":"CAR"},{"prim":"SWAP"},{"prim":"CDR"},{"prim":"DUP"},{"prim":"CAR"},{"prim":"SWAP"},{"prim":"CDR"},{"prim":"DIG","args":[{"int":"4"}]},{"prim":"DUP"},{"prim":"CAR"},{"prim":"SWAP"},{"prim":"CDR"},{"prim":"CDR"},{"prim":"SOME"},{"prim":"SWAP"},{"prim":"UPDATE"},{"prim":"SWAP"},{"prim":"PAIR"},{"prim":"SWAP"},{"prim":"PAIR"},{"prim":"PAIR"},{"prim":"DUG","args":[{"int":"2"}]}]]}],[{"prim":"DROP"}]]}]]},{"prim":"DROP"}]]},{"prim":"DROP"}],[{"prim":"DUP"},{"prim":"ITER","args":[[{"prim":"DUP"},{"prim":"IF_LEFT","args":[[{"prim":"DUP"},{"prim":"CAR"},{"prim":"SENDER"},{"prim":"COMPARE"},{"prim":"EQ"},{"prim":"IF","args":[[{"prim":"PUSH","args":[{"prim":"bool"},{"prim":"True"}]}],[{"prim":"DIG","args":[{"int":"3"}]},{"prim":"DUP"},{"prim":"DUG","args":[{"int":"4"}]},{"prim":"CAR"},{"prim":"CAR"},{"prim":"SENDER"},{"prim":"COMPARE"},{"prim":"EQ"}]]},{"prim":"IF","args":[[{"prim":"SWAP"},{"prim":"DROP"}],[{"prim":"PUSH","args":[{"prim":"int"},{"int":"523"}]},{"prim":"FAILWITH"}]]},{"prim":"DIG","args":[{"int":"2"}]},{"prim":"DUP"},{"prim":"CAR"},{"prim":"SWAP"},{"prim":"CDR"},{"prim":"DUP"},{"prim":"CDR"},{"prim":"SWAP"},{"prim":"CAR"},{"prim":"DUP"},{"prim":"CAR"},{"prim":"SWAP"},{"prim":"CDR"},{"prim":"DIG","args":[{"int":"4"}]},{"prim":"DUP"},{"prim":"CDR"},{"prim":"CDR"},{"prim":"SWAP"},{"prim":"DUP"},{"prim":"DUG","args":[{"int":"6"}]},{"prim":"CDR"},{"prim":"CAR"},{"prim":"PAIR","annots":["%operator","%token_id"]},{"prim":"DIG","args":[{"int":"5"}]},{"prim":"CAR"},{"prim":"PAIR","annots":["%owner"]},{"prim":"PUSH","args":[{"prim":"option","args":[{"prim":"unit"}]},{"prim":"Some","args":[{"prim":"Unit"}]}]},{"prim":"SWAP"},{"prim":"UPDATE"},{"prim":"SWAP"},{"prim":"PAIR"},{"prim":"PAIR"},{"prim":"SWAP"},{"prim":"PAIR"},{"prim":"SWAP"}],[{"prim":"DUP"},{"prim":"CAR"},{"prim":"SENDER"},{"prim":"COMPARE"},{"prim":"EQ"},{"prim":"IF","args":[[{"prim":"PUSH","args":[{"prim":"bool"},{"prim":"True"}]}],[{"prim":"DIG","args":[{"int":"3"}]},{"prim":"DUP"},{"prim":"DUG","args":[{"int":"4"}]},{"prim":"CAR"},{"prim":"CAR"},{"prim":"SENDER"},{"prim":"COMPARE"},{"prim":"EQ"}]]},{"prim":"IF","args":[[{"prim":"SWAP"},{"prim":"DROP"}],[{"prim":"PUSH","args":[{"prim":"int"},{"int":"530"}]},{"prim":"FAILWITH"}]]},{"prim":"DIG","args":[{"int":"2"}]},{"prim":"DUP"},{"prim":"CAR"},{"prim":"SWAP"},{"prim":"CDR"},{"prim":"DUP"},{"prim":"CDR"},{"prim":"SWAP"},{"prim":"CAR"},{"prim":"DUP"},{"prim":"CAR"},{"prim":"SWAP"},{"prim":"CDR"},{"prim":"NONE","args":[{"prim":"unit"}]},{"prim":"DIG","args":[{"int":"5"}]},{"prim":"DUP"},{"prim":"CDR"},{"prim":"CDR"},{"prim":"SWAP"},{"prim":"DUP"},{"prim":"DUG","args":[{"int":"7"}]},{"prim":"CDR"},{"prim":"CAR"},{"prim":"PAIR","annots":["%operator","%token_id"]},{"prim":"DIG","args":[{"int":"6"}]},{"prim":"CAR"},{"prim":"PAIR","annots":["%owner"]},{"prim":"UPDATE"},{"prim":"SWAP"},{"prim":"PAIR"},{"prim":"PAIR"},{"prim":"SWAP"},{"prim":"PAIR"},{"prim":"SWAP"}]]}]]},{"prim":"DROP"}]]},{"prim":"NIL","args":[{"prim":"operation"}]}]]}]]}]]},{"prim":"PAIR"}]]}]`;
        const storage: string = DeployPairMicheline(deploy);

        const nodeResult = await TezosNodeWriter.sendContractOriginationOperation(
            server,
            signer,
            keystore,
            amount,
            undefined,
            fee,
            freight,
            gas,
            code,
            storage,
            TezosParameterFormat.Micheline);
        return clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }

    export async function getStorage(server: string, address: string): Promise<Storage> {
        const storageResult = await TezosNodeReader.getContractStorage(server, address);

        return {
            admin: JSONPath({path: '$.args[0].args[0].string', json: storageResult})[0],
            paused: JSONPath({path: '$.args[1].args[1].args[0].prim', json: storageResult})[0],
            balanceMap: JSONPath({path: '$.args[0].args[1].args[1].int', json: storageResult})[0],
            operatorMap: JSONPath({path: '$.args[1].args[0].args[1].int', json: storageResult})[0],
            metadataMap: JSONPath({path: '$.args[1].args[1].args[1].int', json: storageResult})[0],
        };
    }

    export async function Mint(server: string, address: string, signer: Signer, keystore: KeyStore, amount: number, fee: number, mints: MintPair[], freight: number, gas: number): Promise<string> {
        const entrypoint = `mint`;
        let parameters: string = `[ ${mints.map(m => MintPairMicheline(m)).join(',')} ]`;
        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(
            server,
            signer,
            keystore,
            address,
            amount,
            fee,
            freight,
            gas,
            entrypoint,
            parameters,
            TezosParameterFormat.Micheline);
        return clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }

    export async function Burn(server: string, address: string, signer: Signer, keystore: KeyStore, amount: number, fee: number, burns: BurnPair[], gas: number): Promise<string> {
        const entrypoint = `burn`;
        let parameters: string = `[ ${burns.map(b => BurnPairMicheline(b)).join(',')} ]`;
        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(
            server,
            signer,
            keystore,
            address,
            amount,
            fee,
            0, // burn use 0 storage
            gas,
            entrypoint,
            parameters,
            TezosParameterFormat.Micheline);
        return clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }

    function DeployPairMicheline(deploy: DeployPair): string {
        return `{
            "prim": "Pair",
            "args": [
                { "prim": "Pair", "args": [
                    { "string": "${deploy.admin}" },
                    { "prim": "Pair", "args": [ { "int": "${deploy.all_tokens}" }, ${deploy.ledger} ] } ] },
                { "prim": "Pair", "args": [
                    { "prim": "Pair", "args": [ { "prim": "${deploy.metadata_string}" }, ${deploy.operators} ] },
                    { "prim": "Pair", "args": [ { "prim": "${deploy.paused ? "True" : "False"}" }, ${deploy.tokens} ] } ] }
            ]
        }`;
    }

    export function MintPairMicheline(mint: MintPair): string {
        return `{
            "prim": "Pair",
            "args": [
                { "prim": "Pair", "args": [ { "string": "${mint.address}" }, { "int": "${mint.amount}" } ] },
                { "prim": "Pair", "args": [ { "string": "${mint.sym}" }, { "int": "${mint.token_id}" } ] }
            ]
        }`;
    }

    export function BurnPairMicheline(burn: BurnPair): string {
        return `{
            "prim": "Pair",
            "args": [ { "string": "${burn.address}" },
                { "prim": "Pair", "args": [ { "int": "${burn.amount}" }, { "int": "${burn.token_id}" } ] }
            ]
        }`;
    }
}

function clearRPCOperationGroupHash(hash: string): string {
    return hash.replace(/\"/g, '').replace(/\n/, '');
}


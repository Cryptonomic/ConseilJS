import { JSONPath } from 'jsonpath-plus';

import { TezosConstants } from '../../../../types/tezos/TezosConstants';
import { KeyStore, Signer } from '../../../../types/ExternalInterfaces';
import * as TezosTypes from '../../../../types/tezos/TezosChainTypes';
import { TezosMessageUtils } from '../../TezosMessageUtil';
import { TezosNodeReader } from '../../TezosNodeReader';
import { TezosNodeWriter } from '../../TezosNodeWriter';
import { TezosContractUtils } from '../TezosContractUtils';
import {Transaction} from '../../../../types/tezos/TezosP2PMessageTypes';

export interface MultiAssetSimpleStorage {
    administrator: string,
    tokens: number,
    ledger: number,
    metadata: number,
    paused: string,
    operators: number,
    tokenMetadata: number,
    totalSupply?: number
}

export interface MultiAssetTokenDefinition {
    tokenid: number;
    metadata: Record<string, string>;
}

/*
 * FA2 individual token transfer
 */
export interface TokenTransfer {
    destination: string;
    token_id: number;
    amount: number;
}

/*
 * Returns a TokenTransaction in Michelson format
 */
export function TokenTransactionMichelson(tx: TokenTransfer): string {
    return `Pair "${tx.destination}" (Pair ${tx.token_id} ${tx.amount})`;
}

/*
 * FA2 batch transfer invocation parameters
 */
export interface TransferPair {
    source: string;
    txs: TokenTransfer[]
}

/*
 * Returns a TransferPair in Michelson format
 */
export function TransferPairMichelson(transfers: TransferPair[]): string {
    const transferList: string = transfers.map(
        (transfer) => {
            const txList: string = transfer.txs.map((tx) => TokenTransactionMichelson(tx)).join("; ");
            return `Pair "${transfer.source}" { ${txList} }`;
        }
    ).join("; ");
    return `{ ${transferList} }`
}

export interface UpdateOperator {
    owner: string,
    operator: string,
    tokenid: number
}

/**
 * Interface for the FA2.0 contract implementation outlined here: https://gitlab.com/tzip/tzip/-/tree/master/proposals/tzip-12/tzip-12.md.
 * 
 * Compatible with the contract as of May 24, 2021 from https://smartpy.io/ide?template=FA2.py
 */
export namespace MultiAssetTokenHelper {
    /**
     * Gets the contract code at the specified address at the head block and compares it to the known hash of the code. This function processes Micheline format contracts.
     * 
     * 
     * @param server Destination Tezos node.
     * @param address Contract address to query.
     */
    export async function verifyDestination(server: string, address: string): Promise<boolean> {
        return TezosContractUtils.verifyDestination(server, address, 'cdf4fb6303d606686694d80bd485b6a1');
    }

    /**
     * In contrast to verifyDestination, this function uses compares Michelson hashes.
     * 
     * @param script 
     */
    export function verifyScript(script: string): boolean {
        return TezosContractUtils.verifyScript(script, '000');
    }

    /**
     * 
     * @param server 
     * @param signer 
     * @param keystore 
     * @param fee 
     * @param administrator 
     * @param metadataUrl 
     * @param pause 
     * @param gas 
     * @param freight 
     */
    export async function deployContract(server: string, signer: Signer, keystore: KeyStore, fee: number, administrator: string, metadataUrl: string, pause: boolean = true, gas: number = 800_000, freight: number = 20_000): Promise<string> {
        // code generated from https://smartpy.io/ide?template=FA2.py [May 24, 2021]
        const contract = `parameter (or (or (pair %balance_of (list %requests (pair (address %owner) (nat %token_id))) (contract %callback (list (pair (pair %request (address %owner) (nat %token_id)) (nat %balance))))) (or (pair %mint (pair (address %address) (nat %amount)) (pair (map %metadata string bytes) (nat %token_id))) (address %set_administrator))) (or (or (pair %set_metadata (string %k) (bytes %v)) (bool %set_pause)) (or (list %transfer (pair (address %from_) (list %txs (pair (address %to_) (pair (nat %token_id) (nat %amount)))))) (list %update_operators (or (pair %add_operator (address %owner) (pair (address %operator) (nat %token_id))) (pair %remove_operator (address %owner) (pair (address %operator) (nat %token_id)))))))); 
        storage (pair (pair (pair (address %administrator) (nat %all_tokens)) (pair (big_map %ledger (pair address nat) nat) (big_map %metadata string bytes))) (pair (pair (big_map %operators (pair (address %owner) (pair (address %operator) (nat %token_id))) unit) (bool %paused)) (pair (big_map %token_metadata nat (pair (nat %token_id) (map %token_info string bytes))) (big_map %total_supply nat nat)))); 
        code { CAST (pair (or (or (pair (list (pair address nat)) (contract (list (pair (pair address nat) nat)))) (or (pair (pair address nat) (pair (map string bytes) nat)) address)) (or (or (pair string bytes) bool) (or (list (pair address (list (pair address (pair nat nat))))) (list (or (pair address (pair address nat)) (pair address (pair address nat))))))) (pair (pair (pair address nat) (pair (big_map (pair address nat) nat) (big_map string bytes))) (pair (pair (big_map (pair address (pair address nat)) unit) bool) (pair (big_map nat (pair nat (map string bytes))) (big_map nat nat))))); UNPAIR; IF_LEFT { IF_LEFT { SWAP; DUP; DUG 2; GET 3; CDR; IF { PUSH string "FA2_PAUSED"; FAILWITH; } {}; DUP; CAR; MAP { DUP 3; GET 5; SWAP; DUP; DUG 2; CDR; MEM; IF {} { PUSH string "FA2_TOKEN_UNDEFINED"; FAILWITH; }; DUP 3; CAR; GET 3; SWAP; DUP; CDR; SWAP; DUP; DUG 3; CAR; PAIR; MEM; IF { DUP 3; CAR; GET 3; SWAP; DUP; CDR; SWAP; DUP; DUG 3; CAR; PAIR; GET; IF_SOME { } { PUSH int 430; FAILWITH; }; SWAP; PAIR; } { PUSH nat 0; SWAP; PAIR; }; }; NIL operation; DIG 2; CDR; PUSH mutez 0; DIG 3; TRANSFER_TOKENS; CONS; } { IF_LEFT { SWAP; DUP; DUG 2; CAR; CAR; CAR; SENDER; COMPARE; EQ; IF {} { PUSH string "FA2_NOT_ADMIN"; FAILWITH; }; DUP; GET 4; DUP 3; CAR; CAR; CDR; COMPARE; EQ; IF {} { PUSH string "Token-IDs should be consecutive"; FAILWITH; }; SWAP; DUP; DUG 2; UNPAIR; UNPAIR; CAR; DIG 4; CAR; CAR; CDR; DUP; PUSH nat 1; DUP 7; GET 4; ADD; DUP; DUG 2; COMPARE; LE; IF { DROP; } { SWAP; DROP; }; SWAP; PAIR; PAIR; PAIR; DUP; DUG 2; CAR; GET 3; SWAP; DUP; GET 4; SWAP; DUP; DUG 3; CAR; CAR; PAIR; MEM; IF { SWAP; UNPAIR; UNPAIR; SWAP; UNPAIR; DUP; DIG 5; DUP; GET 4; SWAP; DUP; DUG 7; CAR; CAR; PAIR; DUP; DUG 2; GET; IF_SOME {} { PUSH int 541; FAILWITH; }; DUP 7; CAR; CDR; ADD; SOME; SWAP; UPDATE; PAIR; SWAP; PAIR; PAIR; SWAP; } { SWAP; UNPAIR; UNPAIR; SWAP; UNPAIR; DUP 5; CAR; CDR; SOME; DIG 5; DUP; GET 4; SWAP; DUP; DUG 7; CAR; CAR; PAIR; UPDATE; PAIR; SWAP; PAIR; PAIR; SWAP; }; SWAP; DUP; DUG 2; GET 5; SWAP; DUP; DUG 2; GET 4; MEM; IF { DROP; } { SWAP; DUP; GET 5; DIG 2; DUP; GET 3; SWAP; DUP; DUG 4; GET 4; PAIR; SOME; DUP 4; GET 4; UPDATE; UPDATE 5; DUP; GET 6; DUP 3; CAR; CDR; SOME; DIG 3; GET 4; UPDATE; UPDATE 6; }; } { SWAP; DUP; DUG 2; CAR; CAR; CAR; SENDER; COMPARE; EQ; IF {} { PUSH string "FA2_NOT_ADMIN"; FAILWITH; }; SWAP; UNPAIR; UNPAIR; CDR; DIG 3; PAIR; PAIR; PAIR; }; NIL operation; }; } { IF_LEFT { IF_LEFT { SWAP; DUP; DUG 2; CAR; CAR; CAR; SENDER; COMPARE; EQ; IF {} { PUSH string "FA2_NOT_ADMIN"; FAILWITH; }; SWAP; UNPAIR; UNPAIR; SWAP; UNPAIR; SWAP; DUP 5; CDR; SOME; DIG 5; CAR; UPDATE; SWAP; PAIR; SWAP; PAIR; PAIR; } { SWAP; DUP; DUG 2; CAR; CAR; CAR; SENDER; COMPARE; EQ; IF {} { PUSH string "FA2_NOT_ADMIN"; FAILWITH; }; SWAP; UNPAIR; SWAP; UNPAIR; CAR; DIG 3; SWAP; PAIR; PAIR; SWAP; PAIR; }; } { IF_LEFT { SWAP; DUP; DUG 2; GET 3; CDR; IF { PUSH string "FA2_PAUSED"; FAILWITH; } {}; DUP; ITER { DUP; CDR; ITER { DUP 4; CAR; CAR; CAR; SENDER; COMPARE; EQ; IF { PUSH bool True; } { SENDER; DUP 3; CAR; COMPARE; EQ; }; IF { PUSH bool True; } { DUP 4; GET 3; CAR; SWAP; DUP; DUG 2; GET 3; SENDER; DUP 5; CAR; PAIR 3; MEM; }; IF {} { PUSH string "FA2_NOT_OPERATOR"; FAILWITH; }; DUP 4; GET 5; SWAP; DUP; DUG 2; GET 3; MEM; IF {} { PUSH string "FA2_TOKEN_UNDEFINED"; FAILWITH; }; DUP; GET 4; PUSH nat 0; COMPARE; LT; IF { DUP; GET 4; DUP 5; CAR; GET 3; DUP 3; GET 3; DUP 5; CAR; PAIR; GET; IF_SOME { } { PUSH int 408; FAILWITH; }; COMPARE; GE; IF {} { PUSH string "FA2_INSUFFICIENT_BALANCE"; FAILWITH; }; DUP 4; UNPAIR; UNPAIR; SWAP; UNPAIR; DUP; DUP 6; GET 3; DUP 8; CAR; PAIR; DUP; DUG 2; GET; IF_SOME { DROP; } { PUSH int 412; FAILWITH; }; DUP 6; GET 4; DIG 9; CAR; GET 3; DUP 8; GET 3; DUP 10; CAR; PAIR; GET; IF_SOME { } { PUSH int 412; FAILWITH; }; SUB; ISNAT; IF_SOME {} { PUSH int 412; FAILWITH; }; SOME; SWAP; UPDATE; PAIR; SWAP; PAIR; PAIR; DUP; DUG 4; CAR; GET 3; SWAP; DUP; GET 3; SWAP; DUP; DUG 3; CAR; PAIR; MEM; IF { DIG 3; UNPAIR; UNPAIR; SWAP; UNPAIR; DUP; DIG 5; DUP; GET 3; SWAP; DUP; DUG 7; CAR; PAIR; DUP; DUG 2; GET; IF_SOME {} { PUSH int 415; FAILWITH; }; DIG 6; GET 4; ADD; SOME; SWAP; UPDATE; PAIR; SWAP; PAIR; PAIR; DUG 2; } { DIG 3; UNPAIR; UNPAIR; SWAP; UNPAIR; DUP 5; GET 4; SOME; DIG 5; DUP; GET 3; SWAP; CAR; PAIR; UPDATE; PAIR; SWAP; PAIR; PAIR; DUG 2; }; } { DROP; }; }; DROP; }; DROP; } { DUP; ITER { IF_LEFT { DUP; CAR; SENDER; COMPARE; EQ; IF { PUSH bool True; } { DUP 3; CAR; CAR; CAR; SENDER; COMPARE; EQ; }; IF {} { PUSH string "FA2_NOT_ADMIN_OR_OPERATOR"; FAILWITH; }; DIG 2; UNPAIR; SWAP; UNPAIR; UNPAIR; PUSH (option unit) (Some Unit); DIG 5; DUP; GET 4; SWAP; DUP; GET 3; SWAP; CAR; PAIR 3; UPDATE; PAIR; PAIR; SWAP; PAIR; SWAP; } { DUP; CAR; SENDER; COMPARE; EQ; IF { PUSH bool True; } { DUP 3; CAR; CAR; CAR; SENDER; COMPARE; EQ; }; IF {} { PUSH string "FA2_NOT_ADMIN_OR_OPERATOR"; FAILWITH; }; DIG 2; UNPAIR; SWAP; UNPAIR; UNPAIR; NONE unit; DIG 5; DUP; GET 4; SWAP; DUP; GET 3; SWAP; CAR; PAIR 3; UPDATE; PAIR; PAIR; SWAP; PAIR; SWAP; }; }; DROP; }; }; NIL operation; }; PAIR; };`;
        const paused = pause ? "True" : "False";
        const storage = `(Pair (Pair (Pair "${administrator}" 0) (Pair {} {Elt "" 0x${Buffer.from(metadataUrl, "utf-8").toString("hex")}})) (Pair (Pair {} ${paused}) (Pair {} {})))`;
        const nodeResult = await TezosNodeWriter.sendContractOriginationOperation(server, signer, keystore, 0, undefined, fee, freight, gas, contract, storage, TezosTypes.TezosParameterFormat.Michelson);
        return TezosContractUtils.clearRPCOperationGroupHash(nodeResult['operationGroupID']);
    }

    /**
     * 
     * @param server 
     * @param address 
     */
    export async function getSimpleStorage(server: string, address: string): Promise<MultiAssetSimpleStorage> {
        const storageResult = await TezosNodeReader.getContractStorage(server, address);

        return {
            administrator: JSONPath({ path: '$.args[0].args[0].string', json: storageResult })[0],
            tokens: Number(JSONPath({ path: '$.args[0].args[1].int', json: storageResult })[0]),
            ledger: Number(JSONPath({ path: '$.args[0].args[2].int', json: storageResult })[0]),
            metadata: Number(JSONPath({ path: '$.args[0].args[2].int', json: storageResult })[0]),
            paused: (JSONPath({ path: '$.args[2].prim', json: storageResult })[0]).toString().toLowerCase().startsWith('t'),
            operators: Number(JSONPath({ path: '$.args[1].args[0].int', json: storageResult })[0]),
            tokenMetadata: Number(JSONPath({ path: '$.args[2].int', json: storageResult })[0]),
            totalSupply: Number(JSONPath({ path: '$.args[3].int', json: storageResult })[0])
        };
    }

    /**
     * 
     * @param server 
     * @param map 
     * @param token 
     */
    export async function getTokenDefinition(server: string, mapid: number, token: number = 0): Promise<MultiAssetTokenDefinition> {
        const packedKey = TezosMessageUtils.encodeBigMapKey(Buffer.from(TezosMessageUtils.writePackedData(token, 'nat'), 'hex'));
        const mapResult = await TezosNodeReader.getValueForBigMapKey(server, mapid, packedKey);

        if (mapResult === undefined) { throw new Error(`Map ${mapid} does not contain a record for token ${token}`); }
        const tokenData: MultiAssetTokenDefinition = {
            tokenid: Number(JSONPath({ path: '$.args[0].int', json: mapResult })[0]),
            metadata: {}
        };
        mapResult["args"][1].forEach(item => {
            tokenData.metadata[item["args"][0]["string"]] = Buffer.from(item["args"][1]["bytes"], "hex").toString();
        });
        return tokenData;
    }

    /**
     * 
     * @param server 
     * @param address 
     * @param signer 
     * @param keystore 
     * @param fee 
     * @param gas 
     * @param freight 
     */
    export async function activate(server: string, address: string, signer: Signer, keystore: KeyStore, fee: number, gas: number = 800_000, freight: number = 20_000): Promise<string> {
        const entryPoint = 'set_pause';
        const parameters = 'False';

        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(server, signer, keystore, address, 0, fee, freight, gas, entryPoint, parameters, TezosTypes.TezosParameterFormat.Michelson);

        return TezosContractUtils.clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }

    /**
     * 
     * @param server 
     * @param address 
     * @param signer 
     * @param keystore 
     * @param fee 
     * @param gas 
     * @param freight 
     */
    export async function deactivate(server: string, address: string, signer: Signer, keystore: KeyStore, fee: number, gas: number = 800_000, freight: number = 20_000): Promise<string> {
        const entryPoint = 'set_pause';
        const parameters = 'True';

        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(server, signer, keystore, address, 0, fee, freight, gas, entryPoint, parameters, TezosTypes.TezosParameterFormat.Michelson);

        return TezosContractUtils.clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }

    export async function changeAdministrator(server: string, address: string, signer: Signer, keystore: KeyStore, fee: number, administrator: string, gas: number = 800_000, freight: number = 20_000): Promise<string> {
        const entryPoint = 'set_administrator';
        const parameters = `"${administrator}"`;

        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(server, signer, keystore, address, 0, fee, freight, gas, entryPoint, parameters, TezosTypes.TezosParameterFormat.Michelson);

        return TezosContractUtils.clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }

    /**
     * 
     * @param server 
     * @param address 
     * @param signer 
     * @param keystore 
     * @param fee 
     * @param gas 
     * @param freight 
     */
    export async function mint(server: string, address: string, signer: Signer, keystore: KeyStore, fee: number, destination: string, amount: number, metadata: Record<string, string>, tokenid: number, gas: number = 800_000, freight: number = 20_000): Promise<string> {
        const entryPoint = 'mint';
        const keys = Object.keys(metadata).sort();
        let metaString = ""
        for (let key of keys) {
            if (metaString !== "") metaString += "; "
            metaString += `Elt "${key}" 0x${Buffer.from(metadata[key], "utf-8").toString("hex")}`
        }
        const parameters = `(Pair (Pair "${destination}" ${amount}) (Pair {${metaString}} ${tokenid}))`
        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(server, signer, keystore, address, 0, fee, freight, gas, entryPoint, parameters, TezosTypes.TezosParameterFormat.Michelson);

        return TezosContractUtils.clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }

    export async function transfer(server: string, address: string, signer: Signer, keystore: KeyStore, fee: number, transfers: TransferPair[], gas: number = 800_000, freight: number = 20_000): Promise<string> {
        const entryPoint = 'transfer';
        const parameters = TransferPairMichelson(transfers);
        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(server, signer, keystore, address, 0, fee, freight, gas, entryPoint, parameters, TezosTypes.TezosParameterFormat.Michelson, TezosConstants.HeadBranchOffset, true);

        return TezosContractUtils.clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }

    export function addOperatorsOperation(address: string, counter: number, keystore: KeyStore, fee: number, updateOps: UpdateOperator[], gas: number = 800_000, freight: number = 20_000): Transaction {
        const entryPoint = 'update_operators';
        let parameters = "{";
        updateOps.forEach(op => {
            if (parameters !== "{") parameters += "; ";
            parameters += `Left (Pair "${op.owner}" (Pair "${op.operator}" ${op.tokenid}))`;
        });
        parameters += "}";
        return TezosNodeWriter.constructContractInvocationOperation(keystore.publicKeyHash, counter, address, 0, fee, freight, gas, entryPoint, parameters, TezosTypes.TezosParameterFormat.Michelson);
    }

    export async function addOperators(server: string, address: string, signer: Signer, keystore: KeyStore, fee: number, updateOps: UpdateOperator[], gas: number = 800_000, freight: number = 20_000): Promise<string> {
        const entryPoint = 'update_operators';
        let parameters = "{";
        updateOps.forEach(op => {
            if (parameters !== "{") parameters += "; ";
            parameters += `Left (Pair "${op.owner}" (Pair "${op.operator}" ${op.tokenid}))`;
        });
        parameters += "}";
        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(server, signer, keystore, address, 0, fee, freight, gas, entryPoint, parameters, TezosTypes.TezosParameterFormat.Michelson);

        return TezosContractUtils.clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }

    export function removeOperatorsOperation(address: string, counter: number, keystore: KeyStore, fee: number, updateOps: UpdateOperator[], gas: number = 800_000, freight: number = 20_000): Transaction {
        const entryPoint = 'update_operators';
        let parameters = "{";
        updateOps.forEach(op => {
            if (parameters !== "{") parameters += "; ";
            parameters += `Right (Pair "${op.owner}" (Pair "${op.operator}" ${op.tokenid}))`;
        });
        parameters += "}";
        return TezosNodeWriter.constructContractInvocationOperation(keystore.publicKeyHash, counter, address, 0, fee, freight, gas, entryPoint, parameters, TezosTypes.TezosParameterFormat.Michelson);
    }

    export async function removeOperators(server: string, address: string, signer: Signer, keystore: KeyStore, fee: number, updateOps: UpdateOperator[], gas: number = 800_000, freight: number = 20_000): Promise<string> {
        const entryPoint = 'update_operators';
        let parameters = "{";
        updateOps.forEach(op => {
            if (parameters !== "{") parameters += "; ";
            parameters += `Right (Pair "${op.owner}" (Pair "${op.operator}" ${op.tokenid}))`;
        });
        parameters += "}";
        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(server, signer, keystore, address, 0, fee, freight, gas, entryPoint, parameters, TezosTypes.TezosParameterFormat.Michelson);

        return TezosContractUtils.clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }

    export async function getAccountBalance(server: string, mapid: number, account: string, tokenid: number): Promise<number> {
        const accountHex = `0x${TezosMessageUtils.writeAddress(account)}`;
        const packedKey = TezosMessageUtils.encodeBigMapKey(Buffer.from(TezosMessageUtils.writePackedData(`(Pair ${accountHex} ${tokenid})`, '', TezosTypes.TezosParameterFormat.Michelson), 'hex'));

        const mapResult = await TezosNodeReader.getValueForBigMapKey(server, mapid, packedKey);

        if (mapResult === undefined) { throw new Error(`Map ${mapid} does not contain a record for ${account}/${tokenid}`); }

        const jsonresult = JSONPath({ path: '$.int', json: mapResult });
        return Number(jsonresult[0]);
    }
}

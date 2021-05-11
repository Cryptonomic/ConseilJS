import { JSONPath } from 'jsonpath-plus';

import { TezosMessageUtils } from '../../TezosMessageUtil';
import { TezosNodeReader } from '../../TezosNodeReader';
import { TezosNodeWriter } from '../../TezosNodeWriter';
import { KeyStore, Signer } from '../../../../types/ExternalInterfaces';
import * as TezosTypes from '../../../../types/tezos/TezosChainTypes';
import { TezosContractUtils } from '../TezosContractUtils';

/**
 * Interface for the FA2.0 contract implementation outlined here: https://gitlab.com/tzip/tzip/-/tree/master/proposals/tzip-12/tzip-12.md.
 * 
 * Compatible with the contract as of July 4, 2020 from https://github.com/tqtezos/smart-contracts/blob/master/single_asset/ligo/out/fa2_single_asset.tz
 */
export namespace SingleAssetTokenHelper {
    export interface SingleAssetSimpleStorage {
        administrator: string;
        paused: boolean;
        pendingAdmin: string;
        balanceMap: number;
        operatorMap: number;
        metadataMap: number;
        supply: number;
    }

    export interface SingleAssetTokenDefinition {
        tokenid: number;
        symbol: string;
        name: string;
        scale: number;
    }

    export interface BalancePair {
        address: string;
        balance: number;
    }

    export interface TransferPair {
        address: string;
        tokenid: number;
        balance: number;
    }

    /**
     * Gets the contract code at the specified address at the head block and compares it to the known hash of the code. This function processes Micheline format contracts.
     * 
     * 
     * @param server Destination Tezos node.
     * @param address Contract address to query.
     */
    export async function verifyDestination(server: string, address: string): Promise<boolean> {
        return TezosContractUtils.verifyDestination(server, address, '17aab0975df6139f4ff29be76a67f348');
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
     * @param name 
     * @param symbol 
     * @param tokenid 
     * @param scale 
     * @param pause 
     * @param supply 
     * @param gas 
     * @param freight 
     */
    export async function deployContract(server: string, signer: Signer, keystore: KeyStore, fee: number, administrator: string, name: string, symbol: string, tokenid: number, scale: number, pause: boolean = true, supply: number = 0, gas: number = 800_000, freight: number = 20_000): Promise<string> {
        const contract = `parameter (or (or (or %admin (or (unit %confirm_admin) (bool %pause)) (address %set_admin)) (or %assets (or (pair %balance_of (list %requests (pair (address %owner) (nat %token_id))) (contract %callback (list (pair (pair %request (address %owner) (nat %token_id)) (nat %balance))))) (contract %token_metadata_registry address)) (or (list %transfer (pair (address %from_) (list %txs (pair (address %to_) (pair (nat %token_id) (nat %amount)))))) (list %update_operators (or (pair %add_operator (address %owner) (address %operator)) (pair %remove_operator (address %owner) (address %operator))))))) (or %tokens (list %burn_tokens (pair (nat %amount) (address %owner))) (list %mint_tokens (pair (nat %amount) (address %owner))))) ;
            storage (pair (pair %admin (pair (address %admin) (bool %paused)) (option %pending_admin address)) (pair %assets (pair (big_map %ledger address nat) (big_map %operators (pair address address) unit)) (pair (big_map %token_metadata nat (pair (nat %token_id) (pair (string %symbol) (pair (string %name) (pair (nat %decimals) (map %extras string string)))))) (nat %total_supply)))) ;
            code { PUSH string "FA2_TOKEN_UNDEFINED" ; PUSH string "FA2_INSUFFICIENT_BALANCE" ; LAMBDA (pair address address) (pair address address) { DUP ; CAR ; DIG 1 ; DUP ; DUG 2 ; CDR ; PAIR ; DIP { DROP } } ; LAMBDA (pair address (big_map address nat)) nat { DUP ; CDR ; DIG 1 ; DUP ; DUG 2 ; CAR ; GET ; IF_NONE { PUSH nat 0 } { DUP ; DIP { DROP } } ; DIP { DROP } } ; DUP ; LAMBDA (pair (lambda (pair address (big_map address nat)) nat) (pair (pair address nat) (big_map address nat))) (big_map address nat) { DUP ; CAR ; SWAP ; CDR ; DUP ; CAR ; CAR ; DIG 1 ; DUP ; DUG 2 ; CDR ; DUP ; DIG 2 ; DUP ; DUG 3 ; PAIR ; DIG 4 ; DUP ; DUG 5 ; SWAP ; EXEC ; DIG 3 ; DUP ; DUG 4 ; CAR ; CDR ; DIG 1 ; DUP ; DUG 2 ; ADD ; DIG 2 ; DUP ; DUG 3 ; DIG 1 ; DUP ; DUG 2 ; SOME ; DIG 5 ; DUP ; DUG 6 ; UPDATE ; DIP { DROP 6 } } ; SWAP ; APPLY ; DIP { DIP { DIP { DUP } ; SWAP } ; DUP ; DIP { PAIR } ; SWAP } ; SWAP ; LAMBDA (pair (pair (lambda (pair address (big_map address nat)) nat) string) (pair (pair address nat) (big_map address nat))) (big_map address nat) { DUP ; CAR ; SWAP ; CDR ; DIP { DUP ; CDR ; SWAP ; CAR } ; DUP ; CAR ; CAR ; DIG 1 ; DUP ; DUG 2 ; CDR ; DUP ; DIG 2 ; DUP ; DUG 3 ; PAIR ; DIG 4 ; DUP ; DUG 5 ; SWAP ; EXEC ; DIG 3 ; DUP ; DUG 4 ; CAR ; CDR ; DIG 1 ; DUP ; DUG 2 ; SUB ; ISNAT ; IF_NONE { DIG 5 ; DUP ; DUG 6 ; FAILWITH } { PUSH nat 0 ; DIG 1 ; DUP ; DUG 2 ; COMPARE ; EQ ; IF { DIG 2 ; DUP ; DUG 3 ; DIG 4 ; DUP ; DUG 5 ; NONE nat ; SWAP ; UPDATE } { DIG 2 ; DUP ; DUG 3 ; DIG 1 ; DUP ; DUG 2 ; SOME ; DIG 5 ; DUP ; DUG 6 ; UPDATE } ; DIP { DROP } } ; DIP { DROP 6 } } ; SWAP ; APPLY ; LAMBDA (list (pair nat address)) nat { PUSH nat 0 ; DIG 1 ; DUP ; DUG 2 ; ITER { SWAP ; PAIR ; DUP ; CDR ; CAR ; DIG 1 ; DUP ; DUG 2 ; CAR ; ADD ; DIP { DROP } } ; DIP { DROP } } ; LAMBDA (pair (pair address bool) (option address)) unit { DUP ; CAR ; CAR ; SENDER ; COMPARE ; NEQ ; IF { PUSH string "NOT_AN_ADMIN" ; FAILWITH } { UNIT } ; DIP { DROP } } ; DIG 8 ; DUP ; DUG 9 ; CDR ; DIG 9 ; DUP ; DUG 10 ; CAR ; IF_LEFT { DUP ; IF_LEFT { DIG 2 ; DUP ; DUG 3 ; CAR ; DIG 1 ; DUP ; DUG 2 ; PAIR ; DUP ; CDR ; DIG 1 ; DUP ; DUG 2 ; CAR ; IF_LEFT { DUP ; IF_LEFT { DIG 2 ; DUP ; DUG 3 ; CDR ; IF_NONE { PUSH string "NO_PENDING_ADMIN" ; FAILWITH } { DUP ; SENDER ; COMPARE ; EQ ; IF { DIG 3 ; DUP ; DUG 4 ; CAR ; NONE address ; SWAP ; PAIR ; DUP ; CDR ; SWAP ; CAR ; CDR ; SENDER ; PAIR ; PAIR } { PUSH string "NOT_AN_ADMIN" ; FAILWITH } ; DIP { DROP } } ; DUP ; NIL operation ; PAIR ; DIP { DROP 2 } } { DIG 2 ; DUP ; DUG 3 ; DIG 8 ; DUP ; DUG 9 ; SWAP ; EXEC ; DIG 3 ; DUP ; DUG 4 ; DIG 2 ; DUP ; DUG 3 ; PAIR ; DUP ; CDR ; DIG 1 ; DUP ; DUG 2 ; CAR ; DIP { DUP ; CDR ; SWAP ; CAR ; CAR } ; SWAP ; PAIR ; PAIR ; DIP { DROP } ; NIL operation ; PAIR ; DIP { DROP 2 } } ; DIP { DROP } } { DIG 1 ; DUP ; DUG 2 ; DIG 7 ; DUP ; DUG 8 ; SWAP ; EXEC ; DIG 2 ; DUP ; DUG 3 ; DIG 2 ; DUP ; DUG 3 ; PAIR ; DUP ; CDR ; DIG 1 ; DUP ; DUG 2 ; CAR ; SOME ; SWAP ; CAR ; PAIR ; DIP { DROP } ; NIL operation ; PAIR ; DIP { DROP 2 } } ; DIP { DROP 2 } ; DIG 3 ; DUP ; DUG 4 ; DIG 1 ; DUP ; DUG 2 ; CDR ; SWAP ; CDR ; SWAP ; PAIR ; DIG 1 ; DUP ; DUG 2 ; CAR ; PAIR ; DIP { DROP 2 } } { DIG 2 ; DUP ; DUG 3 ; CAR ; CAR ; CDR ; IF { PUSH string "PAUSED" ; FAILWITH } { UNIT } ; DIG 3 ; DUP ; DUG 4 ; CDR ; DIG 2 ; DUP ; DUG 3 ; PAIR ; DUP ; CDR ; DIG 1 ; DUP ; DUG 2 ; CAR ; IF_LEFT { DUP ; IF_LEFT { DUP ; CAR ; DIG 1 ; DUP ; DUG 2 ; CDR ; PAIR ; DUP ; CDR ; MAP { DUP ; DIP { DROP } } ; DUP ; DIG 2 ; DUP ; DUG 3 ; CAR ; PAIR ; DIP { DROP 2 } ; DIG 3 ; DUP ; DUG 4 ; CAR ; CAR ; DIG 1 ; DUP ; DUG 2 ; PAIR ; DUP ; CAR ; DUP ; CDR ; MAP { PUSH nat 0 ; DIG 1 ; DUP ; DUG 2 ; CDR ; COMPARE ; NEQ ; IF { DIG 19 ; DUP ; DUG 20 ; FAILWITH } { DIG 2 ; DUP ; DUG 3 ; CDR ; DIG 1 ; DUP ; DUG 2 ; CAR ; PAIR ; DIG 17 ; DUP ; DUG 18 ; SWAP ; EXEC ; DIG 1 ; DUP ; DUG 2 ; DIG 1 ; DUP ; DUG 2 ; PAIR ; DUP ; CDR ; CDR ; DIG 1 ; DUP ; DUG 2 ; CDR ; CAR ; PAIR ; DIG 1 ; DUP ; DUG 2 ; CAR ; PAIR ; DUP ; CAR ; DIG 1 ; DUP ; DUG 2 ; CDR ; PAIR ; DIP { DROP 3 } } ; DIP { DROP } } ; DIG 1 ; DUP ; DUG 2 ; CAR ; PUSH mutez 0 ; DIG 2 ; DUP ; DUG 3 ; TRANSFER_TOKENS ; DIP { DROP 3 } ; DIG 4 ; DUP ; DUG 5 ; NIL operation ; DIG 2 ; DUP ; DUG 3 ; CONS ; PAIR ; DIP { DROP 3 } } { DUP ; PUSH mutez 0 ; SELF ; ADDRESS ; TRANSFER_TOKENS ; DIG 3 ; DUP ; DUG 4 ; NIL operation ; DIG 2 ; DUP ; DUG 3 ; CONS ; PAIR ; DIP { DROP 2 } } ; DIP { DROP } } { DUP ; IF_LEFT { DUP ; MAP { DUP ; CDR ; MAP { DUP ; CDR ; CAR ; DIG 1 ; DUP ; DUG 2 ; CAR ; DIG 2 ; DUP ; DUG 3 ; CDR ; CDR ; PAIR ; PAIR ; DIP { DROP } } ; DIG 1 ; DUP ; DUG 2 ; CAR ; PAIR ; DIP { DROP } } ; DUP ; MAP { DUP ; CDR ; MAP { PUSH nat 0 ; DIG 1 ; DUP ; DUG 2 ; CDR ; COMPARE ; NEQ ; IF { DIG 18 ; DUP ; DUG 19 ; FAILWITH } { DUP ; CDR ; DIG 1 ; DUP ; DUG 2 ; CAR ; CDR ; SOME ; DIG 2 ; DUP ; DUG 3 ; CAR ; CAR ; PAIR ; PAIR } ; DIP { DROP } } ; DUP ; DIG 2 ; DUP ; DUG 3 ; CAR ; SOME ; PAIR ; DIP { DROP 2 } } ; SENDER ; DUP ; LAMBDA (pair address (pair address (big_map (pair address address) unit))) unit { DUP ; CAR ; SWAP ; CDR ; DUP ; CAR ; DIG 2 ; DUP ; DUG 3 ; DIG 1 ; DUP ; DUG 2 ; COMPARE ; EQ ; IF { UNIT } { DIG 1 ; DUP ; DUG 2 ; CDR ; DIG 3 ; DUP ; DUG 4 ; DIG 2 ; DUP ; DUG 3 ; PAIR ; MEM ; IF { UNIT } { PUSH string "FA2_NOT_OPERATOR" ; FAILWITH } } ; DIP { DROP 3 } } ; SWAP ; APPLY ; DIP { DROP } ; DIG 5 ; DUP ; DUG 6 ; CAR ; CAR ; DIG 6 ; DUP ; DUG 7 ; CAR ; CDR ; PAIR ; DIG 1 ; DUP ; DUG 2 ; DIG 3 ; DUP ; DUG 4 ; PAIR ; PAIR ; DUP ; CDR ; CDR ; DIG 1 ; DUP ; DUG 2 ; CAR ; CAR ; ITER { SWAP ; PAIR ; DUP ; CDR ; DUP ; CAR ; IF_NONE { UNIT } { DIG 3 ; DUP ; DUG 4 ; CDR ; CAR ; DIG 1 ; DUP ; DUG 2 ; PAIR ; DIG 4 ; DUP ; DUG 5 ; CAR ; CDR ; SWAP ; EXEC ; DIP { DROP } } ; DIG 2 ; DUP ; DUG 3 ; CAR ; DIG 2 ; DUP ; DUG 3 ; CDR ; ITER { SWAP ; PAIR ; DUP ; CAR ; DIG 1 ; DUP ; DUG 2 ; CDR ; PUSH nat 0 ; DIG 1 ; DUP ; DUG 2 ; CDR ; COMPARE ; NEQ ; IF { DIG 25 ; DUP ; DUG 26 ; FAILWITH } { DIG 4 ; DUP ; DUG 5 ; CAR ; IF_NONE { DIG 1 ; DUP ; DUG 2 } { DIG 2 ; DUP ; DUG 3 ; DIG 2 ; DUP ; DUG 3 ; CAR ; CAR ; DIG 2 ; DUP ; DUG 3 ; PAIR ; PAIR ; DIG 22 ; DUP ; DUG 23 ; SWAP ; EXEC ; DIP { DROP } } ; DIG 1 ; DUP ; DUG 2 ; CAR ; CDR ; IF_NONE { DUP } { DIG 1 ; DUP ; DUG 2 ; DIG 3 ; DUP ; DUG 4 ; CAR ; CAR ; DIG 2 ; DUP ; DUG 3 ; PAIR ; PAIR ; DIG 24 ; DUP ; DUG 25 ; SWAP ; EXEC ; DIP { DROP } } ; DIP { DROP } } ; DIP { DROP 3 } } ; DIP { DROP 3 } } ; DIP { DROP } ; DIG 6 ; DUP ; DUG 7 ; DIG 1 ; DUP ; DUG 2 ; DIP { DUP ; CDR ; SWAP ; CAR ; CDR } ; PAIR ; PAIR ; NIL operation ; PAIR ; DIP { DROP 5 } } { DUP ; MAP { DUP ; IF_LEFT { DUP ; LEFT (pair (address %owner) (address %operator)) ; DIP { DROP } } { DUP ; RIGHT (pair (address %owner) (address %operator)) ; DIP { DROP } } ; DUP ; IF_LEFT { DUP ; DIG 17 ; DUP ; DUG 18 ; SWAP ; EXEC ; LEFT (pair (address %operator) (address %owner)) ; DIP { DROP } } { DUP ; DIG 17 ; DUP ; DUG 18 ; SWAP ; EXEC ; RIGHT (pair (address %operator) (address %owner)) ; DIP { DROP } } ; DIP { DROP 2 } } ; SENDER ; DIG 4 ; DUP ; DUG 5 ; CAR ; CDR ; DIG 2 ; DUP ; DUG 3 ; ITER { SWAP ; PAIR ; DUP ; CDR ; DIG 2 ; DUP ; DUG 3 ; DIG 1 ; DUP ; DUG 2 ; PAIR ; DUP ; CDR ; DIG 1 ; DUP ; DUG 2 ; CAR ; IF_LEFT { DUP ; DIP { DROP } } { DUP ; DIP { DROP } } ; CDR ; COMPARE ; EQ ; IF { UNIT } { PUSH string "FA2_NOT_OWNER" ; FAILWITH } ; DIP { DROP } ; DIG 2 ; DUP ; DUG 3 ; CAR ; DIG 2 ; DUP ; DUG 3 ; PAIR ; DUP ; CDR ; DIG 1 ; DUP ; DUG 2 ; CAR ; IF_LEFT { DIG 1 ; DUP ; DUG 2 ; UNIT ; SOME ; DIG 2 ; DUP ; DUG 3 ; CAR ; DIG 3 ; DUP ; DUG 4 ; CDR ; PAIR ; UPDATE ; DIP { DROP } } { DIG 1 ; DUP ; DUG 2 ; DIG 1 ; DUP ; DUG 2 ; CAR ; DIG 2 ; DUP ; DUG 3 ; CDR ; PAIR ; NONE unit ; SWAP ; UPDATE ; DIP { DROP } } ; DIP { DROP 5 } } ; DIG 5 ; DUP ; DUG 6 ; DIG 1 ; DUP ; DUG 2 ; DIP { DUP ; CDR ; SWAP ; CAR ; CAR } ; SWAP ; PAIR ; PAIR ; NIL operation ; PAIR ; DIP { DROP 4 } } ; DIP { DROP } } ; DIP { DROP 2 } ; DIG 4 ; DUP ; DUG 5 ; DIG 1 ; DUP ; DUG 2 ; CDR ; SWAP ; CAR ; PAIR ; DIG 1 ; DUP ; DUG 2 ; CAR ; PAIR ; DIP { DROP 3 } } ; DIP { DROP } } { DIG 1 ; DUP ; DUG 2 ; CAR ; DIG 3 ; DUP ; DUG 4 ; SWAP ; EXEC ; DIG 2 ; DUP ; DUG 3 ; CDR ; DIG 2 ; DUP ; DUG 3 ; PAIR ; DUP ; CDR ; DIG 1 ; DUP ; DUG 2 ; CAR ; IF_LEFT { DIG 1 ; DUP ; DUG 2 ; DIG 1 ; DUP ; DUG 2 ; PAIR ; DUP ; CAR ; DIG 1 ; DUP ; DUG 2 ; CDR ; DUP ; CAR ; CAR ; DIG 2 ; DUP ; DUG 3 ; PAIR ; DUP ; CDR ; DIG 1 ; DUP ; DUG 2 ; CAR ; ITER { SWAP ; PAIR ; DUP ; CDR ; DIG 1 ; DUP ; DUG 2 ; CAR ; DIG 1 ; DUP ; DUG 2 ; CAR ; DIG 2 ; DUP ; DUG 3 ; CDR ; PAIR ; PAIR ; DIG 15 ; DUP ; DUG 16 ; SWAP ; EXEC ; DIP { DROP 2 } } ; DIP { DROP } ; DIG 2 ; DUP ; DUG 3 ; DIG 12 ; DUP ; DUG 13 ; SWAP ; EXEC ; DUP ; DIG 3 ; DUP ; DUG 4 ; CDR ; CDR ; SUB ; ISNAT ; DUP ; IF_NONE { DIG 18 ; DUP ; DUG 19 ; FAILWITH } { DUP ; DIP { DROP } } ; DIG 4 ; DUP ; DUG 5 ; DIG 4 ; DUP ; DUG 5 ; DIP { DUP ; CDR ; SWAP ; CAR ; CDR } ; PAIR ; PAIR ; DIG 1 ; DUP ; DUG 2 ; DIP { DUP ; CAR ; SWAP ; CDR ; CAR } ; SWAP ; PAIR ; SWAP ; PAIR ; NIL operation ; PAIR ; DIP { DROP 8 } } { DIG 1 ; DUP ; DUG 2 ; DIG 1 ; DUP ; DUG 2 ; PAIR ; DUP ; CAR ; DIG 1 ; DUP ; DUG 2 ; CDR ; DUP ; CAR ; CAR ; DIG 2 ; DUP ; DUG 3 ; PAIR ; DUP ; CDR ; DIG 1 ; DUP ; DUG 2 ; CAR ; ITER { SWAP ; PAIR ; DUP ; CDR ; DIG 1 ; DUP ; DUG 2 ; CAR ; DIG 1 ; DUP ; DUG 2 ; CAR ; DIG 2 ; DUP ; DUG 3 ; CDR ; PAIR ; PAIR ; DIG 16 ; DUP ; DUG 17 ; SWAP ; EXEC ; DIP { DROP 2 } } ; DIP { DROP } ; DIG 2 ; DUP ; DUG 3 ; DIG 12 ; DUP ; DUG 13 ; SWAP ; EXEC ; DIG 2 ; DUP ; DUG 3 ; DIG 2 ; DUP ; DUG 3 ; DIP { DUP ; CDR ; SWAP ; CAR ; CDR } ; PAIR ; PAIR ; DIG 1 ; DUP ; DUG 2 ; DIG 4 ; DUP ; DUG 5 ; CDR ; CDR ; ADD ; DIP { DUP ; CAR ; SWAP ; CDR ; CAR } ; SWAP ; PAIR ; SWAP ; PAIR ; DUP ; NIL operation ; PAIR ; DIP { DROP 7 } } ; DIP { DROP 2 } ; DIG 3 ; DUP ; DUG 4 ; DIG 1 ; DUP ; DUG 2 ; CDR ; SWAP ; CAR ; PAIR ; DIG 1 ; DUP ; DUG 2 ; CAR ; PAIR ; DIP { DROP 3 } } ; DIP { DROP 10 } } ; `;
        const storage = `( Pair ( Pair ( Pair "${administrator}" ${pause ? 'True' : 'False'} ) None ) ( Pair ( Pair { } { } ) ( Pair { Elt ${tokenid} ( Pair ${tokenid} ( Pair "${symbol}" ( Pair "${name}" ( Pair ${scale} { } ) ) ) ) } ${supply} ) ) )`;

        const nodeResult = await TezosNodeWriter.sendContractOriginationOperation(server, signer, keystore, 0, undefined, fee, freight, gas, contract, storage, TezosTypes.TezosParameterFormat.Michelson);
        return TezosContractUtils.clearRPCOperationGroupHash(nodeResult['operationGroupID']);
    }

    /**
     * 
     * @param server 
     * @param address 
     */
    export async function getSimpleStorage(server: string, address: string): Promise<SingleAssetSimpleStorage> {
        const storageResult = await TezosNodeReader.getContractStorage(server, address);

        return {
            administrator: JSONPath({ path: '$.args[0].args[0].args[0].string', json: storageResult })[0],
            paused: (JSONPath({ path: '$.args[0].args[0].args[1].prim', json: storageResult })[0]).toString().toLowerCase().startsWith('t'),
            pendingAdmin: JSONPath({ path: '$.args[0].args[1].prim', json: storageResult })[0],
            balanceMap: Number(JSONPath({ path: '$.args[1].args[0].args[0].int', json: storageResult })[0]),
            operatorMap: Number(JSONPath({ path: '$.args[1].args[0].args[1].int', json: storageResult })[0]),
            metadataMap: Number(JSONPath({ path: '$.args[1].args[1].args[0].int', json: storageResult })[0]),
            supply: Number(JSONPath({ path: '$.args[1].args[1].args[1].int', json: storageResult })[0])
        };
    }

    /**
     * 
     * @param server 
     * @param map 
     * @param token 
     */
    export async function getTokenDefinition(server: string, mapid: number, token: number = 0): Promise<SingleAssetTokenDefinition> {
        const packedKey = TezosMessageUtils.encodeBigMapKey(Buffer.from(TezosMessageUtils.writePackedData(token, 'nat'), 'hex'));
        const mapResult = await TezosNodeReader.getValueForBigMapKey(server, mapid, packedKey);

        if (mapResult === undefined) { throw new Error(`Map ${mapid} does not contain a record for token ${token}`); }

        return {
            tokenid: Number(JSONPath({ path: '$.args[0].int', json: mapResult })[0]),
            symbol: JSONPath({ path: '$.args[1].args[0].string', json: mapResult })[0],
            name: JSONPath({ path: '$.args[1].args[1].args[0].string', json: mapResult })[0],
            scale: Number(JSONPath({ path: '$.args[1].args[1].args[1].args[0].int', json: mapResult })[0])
        }
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
        const entryPoint = 'pause';
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
        const entryPoint = 'pause';
        const parameters = 'True';

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
     * @param issue 
     * @param gas 
     * @param freight 
     */
    export async function mint(server: string, address: string, signer: Signer, keystore: KeyStore, fee: number, issue: BalancePair[], gas: number = 800_000, freight: number = 20_000): Promise<string> {
        const entryPoint = 'mint_tokens';
        const parameters = `{ ${issue.map(i => '( Pair ' + i.balance + ' "' + i.address + '" )').join(' ; ')} }`;

        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(server, signer, keystore, address, 0, fee, freight, gas, entryPoint, parameters, TezosTypes.TezosParameterFormat.Michelson);

        return TezosContractUtils.clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }

    //(list %burn_tokens (pair (nat %amount) (address %owner)))

    //(unit %confirm_admin)

    //(address %set_admin)

    /**
     * 
     * @param server 
     * @param address 
     * @param signer 
     * @param keystore 
     * @param fee 
     * @param issue 
     * @param gas 
     * @param freight 
     */
    export async function transfer(server: string, address: string, signer: Signer, keystore: KeyStore, fee: number, source: string, transfers: TransferPair[], gas: number = 800_000, freight: number = 20_000): Promise<string> {
        const entryPoint = 'transfer';
        const parameters = `{ Pair "${source}" { ${transfers.map(t => '( Pair "' + t.address + '" ( Pair ' + t.tokenid + ' ' + t.balance+ ' ) )').join(' ; ')} } }`;

        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(server, signer, keystore, address, 0, fee, freight, gas, entryPoint, parameters, TezosTypes.TezosParameterFormat.Michelson);

        return TezosContractUtils.clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }

    //(pair %add_operator (address %owner) (address %operator))

    //(pair %remove_operator (address %owner) (address %operator)))))))

    /**
     * 
     * @param server 
     * @param mapid 
     * @param account 
     */
    export async function getAccountBalance(server: string, mapid: number, account: string): Promise<number> {
        const packedKey = TezosMessageUtils.encodeBigMapKey(Buffer.from(TezosMessageUtils.writePackedData(account, 'address'), 'hex'));
        const mapResult = await TezosNodeReader.getValueForBigMapKey(server, mapid, packedKey);

        if (mapResult === undefined) { throw new Error(`Map ${mapid} does not contain a record for ${account}`); }

        const jsonresult = JSONPath({ path: '$.int', json: mapResult });
        return Number(jsonresult[0]);
    }
}

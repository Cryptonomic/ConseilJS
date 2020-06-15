import * as blakejs from 'blakejs';
import { JSONPath } from 'jsonpath-plus';

import { TezosLanguageUtil } from '../../TezosLanguageUtil';
import { TezosMessageUtils } from '../../TezosMessageUtil';
import { TezosNodeReader } from '../../TezosNodeReader';
import { TezosNodeWriter } from '../../TezosNodeWriter';
import { KeyStore, Signer } from '../../../../types/ExternalInterfaces';
import * as TezosTypes from '../../../../types/tezos/TezosChainTypes';

/**
 * Interface for the FA2.0 contract implementation outlined here: https://gitlab.com/tzip/tzip/-/tree/master/proposals/tzip-12/tzip-12.md.
 * 
 * Compatible with the contract as of May 19, 2020 from https://gitlab.com/smondet/fa2-smartpy/-/raw/4b5704099fb5d10fb550b1f9648ff4859875a3e0/michelson/20200519-140638+0000_29bfe43_mutran_contract.tz
 */
export namespace NFTReferenceTokenHelper {
    /**
     * Gets the contract code at the specified address at the head block and compares it to the known hash of the code. This function processes Micheline format contracts.
     * 
     * 
     * @param server Destination Tezos node.
     * @param address Contract address to query.
     */
    export async function verifyDestination(server: string, address: string): Promise<boolean> {
        const contract = await TezosNodeReader.getAccountForBlock(server, 'head', address);

        if (!!!contract.script) { throw new Error(`No code found at ${address}`); }

        const k = Buffer.from(blakejs.blake2s(JSON.stringify(contract.script.code), null, 16)).toString('hex');

        if (k !== '0e3e137841a959521324b4ce20ca2df7') { throw new Error(`Contract does not match the expected code hash: ${k}, '0e3e137841a959521324b4ce20ca2df7'`); }

        return true;
    }

    /**
     * In contrast to verifyDestination, this function uses compares Michelson hashes.
     * 
     * @param script 
     */
    export function verifyScript(script: string): boolean {
        const k = Buffer.from(blakejs.blake2s(TezosLanguageUtil.preProcessMichelsonScript(script).join('\n'), null, 16)).toString('hex');

        if (k !== 'b77ada691b1d630622bea243696c84d7') { throw new Error(`Contract does not match the expected code hash: ${k}, 'b77ada691b1d630622bea243696c84d7'`); }

        return true;
    }

    export async function deployContract(server: string, signer: Signer, keystore: KeyStore, fee: number, administrator: string, name: string, symbol: string, tokenid: number, scale: number, pause: boolean = true, supply: number = 0, gas: number = 400_000, freight: number = 8_000): Promise<string> {
        const contract = `{ parameter (or (or (or (pair %balance_of (contract %callback (list (pair (nat %balance) (pair %request (address %owner) (nat %token_id))))) (list %requests (pair (address %owner) (nat %token_id)))) (pair %is_operator (contract %callback (pair (bool %is_operator) (pair %operator (address %operator) (address %owner)))) (pair %operator (address %operator) (address %owner)))) (or (pair %mint (pair (address %address) (nat %amount)) (pair (string %symbol) (nat %token_id))) (or (pair %mutez_transfer (mutez %amount) (address %destination)) (contract %permissions_descriptor (pair (pair (option %custom (pair (option %config_api address) (string %tag))) (or %operator (unit %no_transfer) (or (unit %owner_or_operator_transfer) (unit %owner_transfer)))) (pair (or %receiver (unit %optional_owner_hook) (or (unit %owner_no_op) (unit %required_owner_hook))) (or %sender (unit %optional_owner_hook) (or (unit %owner_no_op) (unit %required_owner_hook))))))))) (or (or (address %set_administrator) (or (bool %set_pause) (pair %token_metadata (contract %callback (list (pair (nat %token_id) (pair (string %symbol) (pair (string %name) (pair (nat %decimals) (map %extras string string))))))) (list %token_ids nat)))) (or (pair %total_supply (contract %callback (list (pair (nat %token_id) (nat %total_supply)))) (list %token_ids nat)) (or (list %transfer (pair (address %from_) (pair (address %to_) (pair (nat %token_id) (nat %amount))))) (list %update_operators (or (pair %add_operator (address %operator) (address %owner)) (pair %remove_operator (address %operator) (address %owner)))))))) ;
            storage (pair (pair (address %administrator) (pair (nat %all_tokens) (big_map %ledger (pair address nat) nat))) (pair (pair (unit %version_20200519_tzip_66736ea_mutran_contract) (big_map %operators (pair (address %owner) (address %operator)) unit)) (pair (bool %paused) (big_map %tokens nat (pair (pair %metadata (nat %token_id) (pair (string %symbol) (pair (string %name) (pair (nat %decimals) (map %extras string string))))) (nat %total_supply)))))) ; 
            code { DUP ; CDR ; SWAP ; CAR ; IF_LEFT { IF_LEFT { IF_LEFT { SWAP ; DUP ; DUG 2 ; { CDR ; CDR ; CAR } ; IF { PUSH string "WrongCondition: ~ self.data.paused" ; FAILWITH } {} ; PUSH (list (pair (nat %balance) (pair %request (address %owner) (nat %token_id)))) {} ; SWAP ; DUP ; DUG 2 ; CDR ; ITER { DUP ; DUG 2 ; CDR ; DIG 2 ; DUP ; DUG 3 ; CAR ; PAIR %owner %token_id ; DIG 4 ; DUP ; DUG 5 ; { CAR ; CDR ; CDR } ; DIG 3 ; DUP ; DUG 4 ; CDR ; DIG 4 ; CAR ; PAIR ; GET ; { IF_NONE { PUSH string "Get-item:161" ; FAILWITH } {} } ; PAIR %balance %request ; CONS } ; NIL operation ; DIG 2 ; DUP ; DUG 3 ; CAR ; PUSH mutez 0 ; DIG 3 ; DUP ; DUG 4 ; NIL (pair (nat %balance) (pair %request (address %owner) (nat %token_id))) ; SWAP ; ITER { CONS } ; DIG 4 ; DROP ; DIG 4 ; DROP ; TRANSFER_TOKENS ; CONS } { DUP ; CAR ; NIL operation ; SWAP ; PUSH mutez 0 ; DIG 3 ; DUP ; DUG 4 ; CDR ; DIG 5 ; DUP ; DUG 6 ; { CDR ; CAR ; CDR } ; DIG 5 ; DUP ; DUG 6 ; { CDR ; CAR } ; DIG 6 ; { CDR ; CDR } ; PAIR %owner %operator ; MEM ; PAIR %is_operator %operator ; TRANSFER_TOKENS ; CONS } } { IF_LEFT { SWAP ; DUP ; DUG 2 ; { CAR ; CAR } ; SENDER ; COMPARE ; EQ ; IF {} { PUSH string "WrongCondition: sp.sender == self.data.administrator" ; FAILWITH } ; SWAP ; DUP ; DUG 2 ; DUP ; CDR ; SWAP ; CAR ; DUP ; CAR ; SWAP ; { CDR ; CDR } ; DIG 4 ; DUP ; DUG 5 ; { CAR ; CDR ; CAR } ; DUP ; PUSH nat 1 ; DIG 6 ; DUP ; DUG 7 ; { CDR ; CDR } ; ADD ; DUP ; DUG 2 ; COMPARE ; LE ; IF { DROP } { SWAP ; DROP } ; DIG 5 ; DROP ; PAIR ; SWAP ; PAIR ; PAIR ; SWAP ; SWAP ; DUP ; DUG 2 ; { CAR ; CDR ; CDR } ; SWAP ; DUP ; DUG 2 ; { CDR ; CDR } ; DIG 2 ; DUP ; DUG 3 ; { CAR ; CAR } ; PAIR ; MEM ; IF { SWAP ; DUP ; DUG 2 ; DUP ; CDR ; SWAP ; CAR ; DUP ; CAR ; SWAP ; CDR ; DUP ; CAR ; SWAP ; CDR ; DUP ; DIG 5 ; DUP ; DUG 6 ; { CDR ; CDR } ; DIG 6 ; DUP ; DUG 7 ; { CAR ; CAR } ; PAIR ; DUP ; DUG 2 ; GET ; { IF_NONE { PUSH string "set_in_top-any" ; FAILWITH } {} } ; DROP ; DIG 5 ; DUP ; DUG 6 ; { CAR ; CDR } ; DIG 7 ; { CAR ; CDR ; CDR } ; DIG 7 ; DUP ; DUG 8 ; { CDR ; CDR } ; DIG 8 ; DUP ; DUG 9 ; { CAR ; CAR } ; PAIR ; GET ; { IF_NONE { PUSH string "Get-item:161" ; FAILWITH } {} } ; ADD ; SOME ; SWAP ; UPDATE ; SWAP ; PAIR ; SWAP ; PAIR ; PAIR ; SWAP } { SWAP ; DUP ; CDR ; SWAP ; CAR ; DUP ; CAR ; SWAP ; CDR ; DUP ; CAR ; SWAP ; CDR ; DIG 4 ; DUP ; DUG 5 ; { CAR ; CDR } ; SOME ; DIG 5 ; DUP ; DUG 6 ; { CDR ; CDR } ; DIG 6 ; DUP ; DUG 7 ; { CAR ; CAR } ; PAIR ; UPDATE ; SWAP ; PAIR ; SWAP ; PAIR ; PAIR ; SWAP } ; SWAP ; DUP ; DUG 2 ; { CDR ; CDR ; CDR } ; SWAP ; DUP ; DUG 2 ; { CDR ; CDR } ; MEM ; IF { SWAP ; DUP ; DUG 2 ; DUP ; CAR ; SWAP ; CDR ; DUP ; CAR ; SWAP ; CDR ; DUP ; CAR ; SWAP ; CDR ; DUP ; DIG 5 ; DUP ; DUG 6 ; { CDR ; CDR } ; DUP ; DUG 2 ; GET ; { IF_NONE { PUSH string "set_in_top-any" ; FAILWITH } {} } ; CAR ; DIG 6 ; DUP ; DUG 7 ; { CAR ; CDR } ; DIG 8 ; { CDR ; CDR ; CDR } ; DIG 8 ; DUP ; DUG 9 ; { CDR ; CDR } ; GET ; { IF_NONE { PUSH string "Get-item:333" ; FAILWITH } {} } ; CDR ; ADD ; SWAP ; PAIR ; SOME ; SWAP ; UPDATE ; SWAP ; PAIR ; SWAP ; PAIR ; SWAP ; PAIR ; SWAP } { SWAP ; DUP ; CAR ; SWAP ; CDR ; DUP ; CAR ; SWAP ; CDR ; DUP ; CAR ; SWAP ; CDR ; DIG 4 ; DUP ; DUG 5 ; { CAR ; CDR } ; PUSH (pair (string %name) (pair (nat %decimals) (map %extras string string))) (Pair "" (Pair 0 {})) ; DIG 6 ; DUP ; DUG 7 ; { CDR ; CAR } ; PAIR %symbol ; DIG 6 ; DUP ; DUG 7 ; { CDR ; CDR } ; PAIR %token_id ; PAIR %metadata %total_supply ; SOME ; DIG 5 ; DUP ; DUG 6 ; { CDR ; CDR } ; UPDATE ; SWAP ; PAIR ; SWAP ; PAIR ; SWAP ; PAIR ; SWAP } ; DROP ; NIL operation } { IF_LEFT { SWAP ; DUP ; DUG 2 ; { CAR ; CAR } ; SENDER ; COMPARE ; EQ ; IF {} { PUSH string "WrongCondition: sp.sender == self.data.administrator" ; FAILWITH } ; DUP ; CDR ; CONTRACT unit ; NIL operation ; SWAP ; { IF_NONE { PUSH unit Unit ; FAILWITH } {} } ; DIG 2 ; CAR ; PUSH unit Unit ; TRANSFER_TOKENS ; CONS } { NIL operation ; SWAP ; PUSH mutez 0 ; PUSH (pair (pair (option %custom (pair (option %config_api address) (string %tag))) (or %operator (unit %no_transfer) (or (unit %owner_or_operator_transfer) (unit %owner_transfer)))) (pair (or %receiver (unit %optional_owner_hook) (or (unit %owner_no_op) (unit %required_owner_hook))) (or %sender (unit %optional_owner_hook) (or (unit %owner_no_op) (unit %required_owner_hook))))) (Pair (Pair None (Right (Left Unit))) (Pair (Right (Left Unit)) (Right (Left Unit)))) ; TRANSFER_TOKENS ; CONS } } } } { IF_LEFT { IF_LEFT { SWAP ; DUP ; DUG 2 ; { CAR ; CAR } ; SENDER ; COMPARE ; EQ ; IF {} { PUSH string "WrongCondition: sp.sender == self.data.administrator" ; FAILWITH } ; SWAP ; DUP ; CDR ; SWAP ; { CAR ; CDR } ; DIG 2 ; PAIR ; PAIR ; NIL operation } { IF_LEFT { SWAP ; DUP ; DUG 2 ; { CAR ; CAR } ; SENDER ; COMPARE ; EQ ; IF {} { PUSH string "WrongCondition: sp.sender == self.data.administrator" ; FAILWITH } ; SWAP ; DUP ; CAR ; SWAP ; CDR ; DUP ; CAR ; SWAP ; { CDR ; CDR } ; DIG 3 ; PAIR ; SWAP ; PAIR ; SWAP ; PAIR ; NIL operation } { SWAP ; DUP ; DUG 2 ; { CDR ; CDR ; CAR } ; IF { PUSH string "WrongCondition: ~ self.data.paused" ; FAILWITH } {} ; PUSH (list (pair (nat %token_id) (pair (string %symbol) (pair (string %name) (pair (nat %decimals) (map %extras string string)))))) {} ; SWAP ; DUP ; DUG 2 ; CDR ; ITER { SWAP ; DIG 3 ; DUP ; DUG 4 ; { CDR ; CDR ; CDR } ; DIG 2 ; GET ; { IF_NONE { PUSH string "Get-item:429" ; FAILWITH } {} } ; CAR ; CONS } ; NIL operation ; DIG 2 ; DUP ; DUG 3 ; CAR ; PUSH mutez 0 ; DIG 3 ; DUP ; DUG 4 ; NIL (pair (nat %token_id) (pair (string %symbol) (pair (string %name) (pair (nat %decimals) (map %extras string string))))) ; SWAP ; ITER { CONS } ; DIG 4 ; DROP ; DIG 4 ; DROP ; TRANSFER_TOKENS ; CONS } } } { IF_LEFT { SWAP ; DUP ; DUG 2 ; { CDR ; CDR ; CAR } ; IF { PUSH string "WrongCondition: ~ self.data.paused" ; FAILWITH } {} ; PUSH (list (pair (nat %token_id) (nat %total_supply))) {} ; SWAP ; DUP ; DUG 2 ; CDR ; ITER { SWAP ; DIG 3 ; DUP ; DUG 4 ; { CDR ; CDR ; CDR } ; DIG 2 ; DUP ; DUG 3 ; GET ; { IF_NONE { PUSH string "Get-item:415" ; FAILWITH } {} } ; CDR ; DIG 2 ; PAIR %token_id %total_supply ; CONS } ; NIL operation ; DIG 2 ; DUP ; DUG 3 ; CAR ; PUSH mutez 0 ; DIG 3 ; DUP ; DUG 4 ; NIL (pair (nat %token_id) (nat %total_supply)) ; SWAP ; ITER { CONS } ; DIG 4 ; DROP ; DIG 4 ; DROP ; TRANSFER_TOKENS ; CONS } { IF_LEFT { SWAP ; DUP ; DUG 2 ; { CDR ; CDR ; CAR } ; IF { PUSH string "WrongCondition: ~ self.data.paused" ; FAILWITH } {} ; DUP ; { DUP ; DROP } ; NIL operation } } } ; PAIR } } ;`;
        const storage = `(Pair (Pair "${administrator}" ( Pair 0 { } ) ) (Pair (Pair Unit { } ) ( Pair ${pause ? 'True' : 'False'} { } ) ) )`;

        const nodeResult = await TezosNodeWriter.sendContractOriginationOperation(server, signer, keystore, 0, undefined, fee, freight, gas, contract, storage, TezosTypes.TezosParameterFormat.Michelson);
        return clearRPCOperationGroupHash(nodeResult['operationGroupID']);
    }

    export async function getSimpleStorage(server: string, address: string): Promise<any> {
        return null;
    }

    export async function getAccountBalance(server: string, mapid: number, account: string): Promise<number> {
        return 0;
    }

    function clearRPCOperationGroupHash(hash: string) {
        return hash.replace(/\"/g, '').replace(/\n/, '');
    }
}
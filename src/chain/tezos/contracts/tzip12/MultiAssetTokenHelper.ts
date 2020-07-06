import { JSONPath } from 'jsonpath-plus';
import { KeyStore, Signer } from '../../../../types/ExternalInterfaces';
import * as TezosTypes from '../../../../types/tezos/TezosChainTypes';
import { TezosMessageUtils } from '../../TezosMessageUtil';
import { TezosNodeReader } from '../../TezosNodeReader';
import { TezosNodeWriter } from '../../TezosNodeWriter';
import { TezosContractUtils } from '../TezosContractUtils';

interface MultiAssetSimpleStorage {
    administrator: string;
    tokens: number;
    balanceMap: number;
    operatorMap: number;
    paused: boolean;
    metadataMap: number;
}

interface MultiAssetTokenDefinition {
    tokenid: number;
    symbol: string;
    name: string;
    scale: number;
    supply: number;
}

interface TransferPair {
    address: string;
    tokenid: number;
    balance: number;
}

/**
 * Interface for the FA2.0 contract implementation outlined here: https://gitlab.com/tzip/tzip/-/tree/master/proposals/tzip-12/tzip-12.md.
 * 
 * Compatible with the contract as of July 4, 2020 from https://gitlab.com/smondet/fa2-smartpy/-/blob/master/michelson/20200615-162614+0000_e1e6c44_contract.tz
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
        const contract = `parameter (or (or (or (pair %balance_of (list %requests (pair (address %owner) (nat %token_id))) (contract %callback (list (pair (pair %request (address %owner) (nat %token_id)) (nat %balance))))) (pair %mint (pair (address %address) (nat %amount)) (pair (string %symbol) (nat %token_id)))) (or (address %set_administrator) (bool %set_pause))) (or (or (pair %token_metadata (list %token_ids nat) (lambda %handler (list (pair (nat %token_id) (pair (string %symbol) (pair (string %name) (pair (nat %decimals) (map %extras string string)))))) unit)) (contract %token_metadata_regitry address)) (or (list %transfer (pair (address %from_) (list %txs (pair (address %to_) (pair (nat %token_id) (nat %amount)))))) (list %update_operators (or (pair %add_operator (address %owner) (address %operator)) (pair %remove_operator (address %owner) (address %operator))))))) ;
            storage (pair (pair (address %administrator) (pair (nat %all_tokens) (big_map %ledger (pair address nat) nat))) (pair (pair (unit %version_20200615_tzip_a57dfe86_contract) (big_map %operators (pair (address %owner) (address %operator)) unit)) (pair (bool %paused) (big_map %tokens nat (pair (pair %metadata (nat %token_id) (pair (string %symbol) (pair (string %name) (pair (nat %decimals) (map %extras string string))))) (nat %total_supply)))))) ;
            code { DUP ; CDR ; SWAP ; CAR ; IF_LEFT { IF_LEFT { IF_LEFT { SWAP ; DUP ; DUG 2 ; { CDR ; CDR ; CAR } ; IF { PUSH string "WrongCondition: ~ self.data.paused" ; FAILWITH } {} ; NIL (pair (pair %request (address %owner) (nat %token_id)) (nat %balance)) ; SWAP ; DUP ; DUG 2 ; CAR ; ITER { SWAP ; DIG 3 ; DUP ; DUG 4 ; { CAR ; CDR ; CDR } ; DIG 2 ; DUP ; DUG 3 ; CDR ; DIG 3 ; DUP ; DUG 4 ; CAR ; PAIR ; GET ; { IF_NONE { PUSH string "Get-item:190" ; FAILWITH } {} } ; DIG 2 ; DUP ; DUG 3 ; CDR ; DIG 3 ; CAR ; PAIR %owner %token_id ; PAIR %request %balance ; CONS } ; NIL operation ; DIG 2 ; DUP ; DUG 3 ; CDR ; PUSH mutez 0 ; DIG 3 ; DUP ; DUG 4 ; NIL (pair (pair %request (address %owner) (nat %token_id)) (nat %balance)) ; SWAP ; ITER { CONS } ; DIG 4 ; DROP ; DIG 4 ; DROP ; TRANSFER_TOKENS ; CONS } { SWAP ; DUP ; DUG 2 ; { CAR ; CAR } ; SENDER ; COMPARE ; EQ ; IF {} { PUSH string "WrongCondition: sp.sender == self.data.administrator" ; FAILWITH } ; SWAP ; DUP ; DUG 2 ; DUP ; CDR ; SWAP ; CAR ; DUP ; CAR ; SWAP ; { CDR ; CDR } ; DIG 4 ; DUP ; DUG 5 ; { CAR ; CDR ; CAR } ; DUP ; PUSH nat 1 ; DIG 6 ; DUP ; DUG 7 ; { CDR ; CDR } ; ADD ; DUP ; DUG 2 ; COMPARE ; LE ; IF { DROP } { SWAP ; DROP } ; DIG 5 ; DROP ; PAIR ; SWAP ; PAIR ; PAIR ; SWAP ; SWAP ; DUP ; DUG 2 ; { CAR ; CDR ; CDR } ; SWAP ; DUP ; DUG 2 ; { CDR ; CDR } ; DIG 2 ; DUP ; DUG 3 ; { CAR ; CAR } ; PAIR ; MEM ; IF { SWAP ; DUP ; DUG 2 ; DUP ; CDR ; SWAP ; CAR ; DUP ; CAR ; SWAP ; CDR ; DUP ; CAR ; SWAP ; CDR ; DUP ; DIG 5 ; DUP ; DUG 6 ; { CDR ; CDR } ; DIG 6 ; DUP ; DUG 7 ; { CAR ; CAR } ; PAIR ; DUP ; DUG 2 ; GET ; { IF_NONE { PUSH string "set_in_top-any" ; FAILWITH } {} } ; DROP ; DIG 5 ; DUP ; DUG 6 ; { CAR ; CDR } ; DIG 7 ; { CAR ; CDR ; CDR } ; DIG 7 ; DUP ; DUG 8 ; { CDR ; CDR } ; DIG 8 ; DUP ; DUG 9 ; { CAR ; CAR } ; PAIR ; GET ; { IF_NONE { PUSH string "Get-item:190" ; FAILWITH } {} } ; ADD ; SOME ; SWAP ; UPDATE ; SWAP ; PAIR ; SWAP ; PAIR ; PAIR ; SWAP } { SWAP ; DUP ; CDR ; SWAP ; CAR ; DUP ; CAR ; SWAP ; CDR ; DUP ; CAR ; SWAP ; CDR ; DIG 4 ; DUP ; DUG 5 ; { CAR ; CDR } ; SOME ; DIG 5 ; DUP ; DUG 6 ; { CDR ; CDR } ; DIG 6 ; DUP ; DUG 7 ; { CAR ; CAR } ; PAIR ; UPDATE ; SWAP ; PAIR ; SWAP ; PAIR ; PAIR ; SWAP } ; SWAP ; DUP ; DUG 2 ; { CDR ; CDR ; CDR } ; SWAP ; DUP ; DUG 2 ; { CDR ; CDR } ; MEM ; IF { SWAP ; DUP ; DUG 2 ; DUP ; CAR ; SWAP ; CDR ; DUP ; CAR ; SWAP ; CDR ; DUP ; CAR ; SWAP ; CDR ; DUP ; DIG 5 ; DUP ; DUG 6 ; { CDR ; CDR } ; DUP ; DUG 2 ; GET ; { IF_NONE { PUSH string "set_in_top-any" ; FAILWITH } {} } ; CAR ; DIG 6 ; DUP ; DUG 7 ; { CAR ; CDR } ; DIG 8 ; { CDR ; CDR ; CDR } ; DIG 8 ; DUP ; DUG 9 ; { CDR ; CDR } ; GET ; { IF_NONE { PUSH string "Get-item:431" ; FAILWITH } {} } ; CDR ; ADD ; SWAP ; PAIR ; SOME ; SWAP ; UPDATE ; SWAP ; PAIR ; SWAP ; PAIR ; SWAP ; PAIR ; SWAP } { SWAP ; DUP ; CAR ; SWAP ; CDR ; DUP ; CAR ; SWAP ; CDR ; DUP ; CAR ; SWAP ; CDR ; DIG 4 ; DUP ; DUG 5 ; { CAR ; CDR } ; PUSH (pair (string %name) (pair (nat %decimals) (map %extras string string))) (Pair "" (Pair 0 {})) ; DIG 6 ; DUP ; DUG 7 ; { CDR ; CAR } ; PAIR %symbol ; DIG 6 ; DUP ; DUG 7 ; { CDR ; CDR } ; PAIR %token_id ; PAIR %metadata %total_supply ; SOME ; DIG 5 ; DUP ; DUG 6 ; { CDR ; CDR } ; UPDATE ; SWAP ; PAIR ; SWAP ; PAIR ; SWAP ; PAIR ; SWAP } ; DROP ; NIL operation } } { IF_LEFT { SWAP ; DUP ; DUG 2 ; { CAR ; CAR } ; SENDER ; COMPARE ; EQ ; IF {} { PUSH string "WrongCondition: sp.sender == self.data.administrator" ; FAILWITH } ; SWAP ; DUP ; CDR ; SWAP ; { CAR ; CDR } ; DIG 2 ; PAIR ; PAIR } { SWAP ; DUP ; DUG 2 ; { CAR ; CAR } ; SENDER ; COMPARE ; EQ ; IF {} { PUSH string "WrongCondition: sp.sender == self.data.administrator" ; FAILWITH } ; SWAP ; DUP ; CAR ; SWAP ; CDR ; DUP ; CAR ; SWAP ; { CDR ; CDR } ; DIG 3 ; PAIR ; SWAP ; PAIR ; SWAP ; PAIR } ; NIL operation } } { IF_LEFT { IF_LEFT { SWAP ; DUP ; DUG 2 ; { CDR ; CDR ; CAR } ; IF { PUSH string "WrongCondition: ~ self.data.paused" ; FAILWITH } {} ; NIL (pair (nat %token_id) (pair (string %symbol) (pair (string %name) (pair (nat %decimals) (map %extras string string))))) ; SWAP ; DUP ; DUG 2 ; CAR ; ITER { SWAP ; DIG 3 ; DUP ; DUG 4 ; { CDR ; CDR ; CDR } ; DIG 2 ; GET ; { IF_NONE { PUSH string "Get-item:523" ; FAILWITH } {} } ; CAR ; CONS } ; SWAP ; DUP ; DUG 2 ; CDR ; SWAP ; DUP ; DUG 2 ; NIL (pair (nat %token_id) (pair (string %symbol) (pair (string %name) (pair (nat %decimals) (map %extras string string))))) ; SWAP ; ITER { CONS } ; EXEC ; DROP 3 ; NIL operation } { SWAP ; DUP ; DUG 2 ; { CDR ; CDR ; CAR } ; IF { PUSH string "WrongCondition: ~ self.data.paused" ; FAILWITH } {} ; DUP ; NIL operation ; SWAP ; PUSH mutez 0 ; SELF ; DIG 4 ; DROP ; ADDRESS ; TRANSFER_TOKENS ; CONS } } { IF_LEFT { SWAP ; DUP ; DUG 2 ; { CDR ; CDR ; CAR } ; IF { PUSH string "WrongCondition: ~ self.data.paused" ; FAILWITH } {} ; DUP ; ITER { DIG 2 ; DUP ; DUG 3 ; { CAR ; CAR } ; SENDER ; COMPARE ; EQ ; IF { PUSH bool True } { DUP ; CAR ; SENDER ; COMPARE ; EQ } ; IF { PUSH bool True } { DIG 2 ; DUP ; DUG 3 ; { CDR ; CAR ; CDR } ; SENDER ; DIG 2 ; DUP ; DUG 3 ; CAR ; PAIR %owner %operator ; MEM } ; IF {} { PUSH string "WrongCondition: ((sp.sender == self.data.administrator) | (transfer.from_ == sp.sender)) | (self.data.operators.contains(sp.record(operator = sp.sender, owner = transfer.from_)))" ; FAILWITH } ; DUP ; CDR ; ITER { DUP ; { CDR ; CDR } ; PUSH nat 0 ; COMPARE ; LT ; IF {} { PUSH string "TRANSFER_OF_ZERO" ; FAILWITH } ; DUP ; { CDR ; CDR } ; DIG 4 ; DUP ; DUG 5 ; { CAR ; CDR ; CDR } ; DIG 2 ; DUP ; DUG 3 ; { CDR ; CAR } ; DIG 4 ; DUP ; DUG 5 ; CAR ; PAIR ; GET ; { IF_NONE { PUSH string "Get-item:190" ; FAILWITH } {} } ; COMPARE ; GE ; IF {} { PUSH string "WrongCondition: self.data.ledger[(transfer.from_, tx.token_id)].balance >= tx.amount" ; FAILWITH } ; DIG 3 ; DUP ; DUG 4 ; DUP ; CDR ; SWAP ; CAR ; DUP ; CAR ; SWAP ; CDR ; DUP ; CAR ; SWAP ; CDR ; DUP ; DIG 5 ; DUP ; DUG 6 ; { CDR ; CAR } ; DIG 7 ; DUP ; DUG 8 ; CAR ; PAIR ; DUP ; DUG 2 ; GET ; { IF_NONE { PUSH string "set_in_top-any" ; FAILWITH } {} } ; DROP ; DIG 5 ; DUP ; DUG 6 ; { CDR ; CDR } ; DIG 9 ; { CAR ; CDR ; CDR } ; DIG 7 ; DUP ; DUG 8 ; { CDR ; CAR } ; DIG 9 ; DUP ; DUG 10 ; CAR ; PAIR ; GET ; { IF_NONE { PUSH string "Get-item:190" ; FAILWITH } {} } ; SUB ; ISNAT ; { IF_NONE { PUSH unit Unit ; FAILWITH } {} } ; SOME ; SWAP ; UPDATE ; SWAP ; PAIR ; SWAP ; PAIR ; PAIR ; DUG 3 ; DIG 3 ; DUP ; DUG 4 ; { CAR ; CDR ; CDR } ; SWAP ; DUP ; DUG 2 ; { CDR ; CAR } ; DIG 2 ; DUP ; DUG 3 ; CAR ; PAIR ; MEM ; IF { DIG 3 ; DUP ; DUG 4 ; DUP ; CDR ; SWAP ; CAR ; DUP ; CAR ; SWAP ; CDR ; DUP ; CAR ; SWAP ; CDR ; DUP ; DIG 5 ; DUP ; DUG 6 ; { CDR ; CAR } ; DIG 6 ; DUP ; DUG 7 ; CAR ; PAIR ; DUP ; DUG 2 ; GET ; { IF_NONE { PUSH string "set_in_top-any" ; FAILWITH } {} } ; DROP ; DIG 5 ; DUP ; DUG 6 ; { CDR ; CDR } ; DIG 9 ; { CAR ; CDR ; CDR } ; DIG 7 ; DUP ; DUG 8 ; { CDR ; CAR } ; DIG 8 ; DUP ; DUG 9 ; CAR ; PAIR ; GET ; { IF_NONE { PUSH string "Get-item:190" ; FAILWITH } {} } ; ADD ; SOME ; SWAP ; UPDATE ; SWAP ; PAIR ; SWAP ; PAIR ; PAIR ; DUG 3 } { DIG 3 ; DUP ; CDR ; SWAP ; CAR ; DUP ; CAR ; SWAP ; CDR ; DUP ; CAR ; SWAP ; CDR ; DIG 4 ; DUP ; DUG 5 ; { CDR ; CDR } ; SOME ; DIG 5 ; DUP ; DUG 6 ; { CDR ; CAR } ; DIG 6 ; DUP ; DUG 7 ; CAR ; PAIR ; UPDATE ; SWAP ; PAIR ; SWAP ; PAIR ; PAIR ; DUG 3 } ; DROP } ; DROP } ; DROP } { DUP ; ITER { DUP ; IF_LEFT { DROP ; DUP ; SENDER ; SWAP ; IF_LEFT {} { DROP ; PUSH unit Unit ; FAILWITH } ; CAR ; COMPARE ; EQ ; IF { PUSH bool True } { DIG 2 ; DUP ; DUG 3 ; { CAR ; CAR } ; SENDER ; COMPARE ; EQ } ; IF {} { PUSH string "WrongCondition: (update.open_variant('add_operator').owner == sp.sender) | (sp.sender == self.data.administrator)" ; FAILWITH } ; DIG 2 ; DUP ; DUG 3 ; DUP ; CAR ; SWAP ; CDR ; DUP ; CDR ; SWAP ; CAR ; DUP ; CAR ; SWAP ; CDR ; PUSH (option unit) (Some Unit) ; DIG 5 ; DUP ; DUG 6 ; IF_LEFT {} { DROP ; PUSH unit Unit ; FAILWITH } ; CDR ; DIG 6 ; DUP ; DUG 7 ; IF_LEFT {} { DROP ; PUSH unit Unit ; FAILWITH } ; DIG 9 ; DROP ; CAR ; PAIR %owner %operator ; UPDATE ; SWAP ; PAIR ; PAIR ; SWAP ; PAIR ; DUG 2 } { DROP ; DUP ; SENDER ; SWAP ; IF_LEFT { DROP ; PUSH unit Unit ; FAILWITH } {} ; CAR ; COMPARE ; EQ ; IF { PUSH bool True } { DIG 2 ; DUP ; DUG 3 ; { CAR ; CAR } ; SENDER ; COMPARE ; EQ } ; IF {} { PUSH string "WrongCondition: (update.open_variant('remove_operator').owner == sp.sender) | (sp.sender == self.data.administrator)" ; FAILWITH } ; DIG 2 ; DUP ; DUG 3 ; DUP ; CAR ; SWAP ; CDR ; DUP ; CDR ; SWAP ; CAR ; DUP ; CAR ; SWAP ; CDR ; NONE unit ; DIG 5 ; DUP ; DUG 6 ; IF_LEFT { DROP ; PUSH unit Unit ; FAILWITH } {} ; CDR ; DIG 6 ; DUP ; DUG 7 ; IF_LEFT { DROP ; PUSH unit Unit ; FAILWITH } {} ; DIG 9 ; DROP ; CAR ; PAIR %owner %operator ; UPDATE ; SWAP ; PAIR ; PAIR ; SWAP ; PAIR ; DUG 2 } ; DROP } ; DROP } ; NIL operation } } ; PAIR } ;`;
        const storage = `( Pair ( Pair "${administrator}" ( Pair 0 { } ) ) ( Pair ( Pair Unit { } ) ( Pair ${pause ? 'True' : 'False'} { Elt ${tokenid} ( Pair ( Pair ${tokenid} ( Pair "${symbol}" ( Pair "${name}" ( Pair ${scale} { } ) ) ) ) ${supply} ) } ) ) )`;

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
            tokens: Number(JSONPath({ path: '$.args[0].args[1].args[0].int', json: storageResult })[0]),
            balanceMap: Number(JSONPath({ path: '$.args[0].args[1].args[1].int', json: storageResult })[0]),
            operatorMap: Number(JSONPath({ path: '$.args[1].args[0].args[1].int', json: storageResult })[0]),
            paused: (JSONPath({ path: '$.args[1].args[1].args[0].prim', json: storageResult })[0]).toString().toLowerCase().startsWith('t'),
            metadataMap: Number(JSONPath({ path: '$.args[1].args[1].args[1].int', json: storageResult })[0]),
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

        return {
            tokenid: Number(JSONPath({ path: '$.args[0].args[0].int', json: mapResult })[0]),
            symbol: JSONPath({ path: '$.args[0].args[1].args[0].string', json: mapResult })[0],
            name: JSONPath({ path: '$.args[0].args[1].args[1].args[0].string', json: mapResult })[0],
            scale: Number(JSONPath({ path: '$.args[0].args[1].args[1].args[1].args[0].int', json: mapResult })[0]),
            // extra metadata: $.args[0].args[1].args[1].args[1].args[1]
            supply: Number(JSONPath({ path: '$.args[1].int', json: mapResult })[0])
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
     * @param issue 
     * @param gas 
     * @param freight 
     */
    export async function mint(server: string, address: string, signer: Signer, keystore: KeyStore, fee: number, destination: string, balance: number, symbol: string, tokenid: number, gas: number = 800_000, freight: number = 20_000): Promise<string> {
        const entryPoint = 'mint';
        const parameters = `(Pair (Pair "${destination}" ${balance}) (Pair "${symbol}" ${tokenid}))`;

        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(server, signer, keystore, address, 0, fee, freight, gas, entryPoint, parameters, TezosTypes.TezosParameterFormat.Michelson);

        return TezosContractUtils.clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }

    export async function transfer(server: string, address: string, signer: Signer, keystore: KeyStore, fee: number, source: string, transfers: TransferPair[], gas: number = 800_000, freight: number = 20_000): Promise<string> {
        const entryPoint = 'transfer';
        const parameters = `{ Pair "${source}" { ${transfers.map(t => '( Pair "' + t.address + '" ( Pair ' + t.tokenid + ' ' + t.balance+ ' ) )').join(' ; ')} } }`;

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

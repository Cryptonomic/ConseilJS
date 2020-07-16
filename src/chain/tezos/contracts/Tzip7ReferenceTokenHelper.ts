import * as blakejs from 'blakejs';
import { JSONPath } from 'jsonpath-plus';

import { TezosLanguageUtil } from '../TezosLanguageUtil';
import { TezosMessageUtils } from '../TezosMessageUtil';
import { TezosNodeReader } from '../TezosNodeReader';
import { TezosNodeWriter } from '../TezosNodeWriter';
import { KeyStore } from '../../../types/wallet/KeyStore';
import * as TezosTypes from '../../../types/tezos/TezosChainTypes';

/**
 * Interface for the FA1.2 contract implementation from the Morley Project outlined here: https://gitlab.com/tzip/tzip/blob/master/proposals/tzip-7/ManagedLedger.md
 * 
 * Compatible with the contract as of January 22, 2020 from https://gitlab.com/tzip/tzip/raw/master/proposals/tzip-7/ManagedLedger.tz
 * 
 * This wrapper does not include support for the following contract functions: getAllowance, getBalance, getTotalSupply, getAdministrator. This information is retrieved by querying the big_map structure on chain directly.
 */
export namespace Tzip7ReferenceTokenHelper {
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

    export async function deployContract(server: string, keystore: KeyStore, fee: number, administrator: string, pause: boolean = true, supply: number = 0, gas: number = 150_000, freight: number = 5_000) {
        const contract = `parameter (or (or (or (pair %transfer (address :from) (pair (address :to) (nat :value))) (pair %approve (address :spender) (nat :value))) (or (pair %getAllowance (pair (address :owner) (address :spender)) (contract nat)) (or (pair %getBalance (address :owner) (contract nat)) (pair %getTotalSupply unit (contract nat))))) (or (or (bool %setPause) (address %setAdministrator)) (or (pair %getAdministrator unit (contract address)) (or (pair %mint (address :to) (nat :value)) (pair %burn (address :from) (nat :value))))));
        storage (pair (big_map %ledger (address :user) (pair (nat :balance) (map :approvals (address :spender) (nat :value)))) (pair (address %admin) (pair (bool %paused) (nat %totalSupply))));
        code { CAST (pair (or (or (or (pair address (pair address nat)) (pair address nat)) (or (pair (pair address address) (contract nat)) (or (pair address (contract nat)) (pair unit (contract nat))))) (or (or bool address) (or (pair unit (contract address)) (or (pair address nat) (pair address nat))))) (pair (big_map address (pair nat (map address nat))) (pair address (pair bool nat)))); DUP; CAR; DIP { CDR }; IF_LEFT { IF_LEFT { IF_LEFT { DIP { DUP; CDR; CDR; CAR; IF { UNIT; PUSH string "TokenOperationsArePaused"; PAIR; FAILWITH } {  } }; DUP; DUP; CDR; CAR; DIP { CAR }; COMPARE; EQ; IF { DROP } { DUP; CAR; SENDER; COMPARE; EQ; IF {  } { DUP; DIP { DUP; DIP { DIP { DUP }; CAR; SENDER; PAIR; DUP; DIP { CDR; DIP { CAR }; GET; IF_NONE { EMPTY_MAP (address) nat } { CDR } }; CAR; GET; IF_NONE { PUSH nat 0 } {  } }; DUP; CAR; DIP { SENDER; DIP { DUP; CDR; CDR; DIP { DIP { DUP }; SWAP }; SWAP; SUB; ISNAT; IF_NONE { DIP { DUP }; SWAP; DIP { DUP }; SWAP; CDR; CDR; PAIR; PUSH string "NotEnoughAllowance"; PAIR; FAILWITH } {  } }; PAIR }; PAIR; DIP { DROP; DROP }; DIP { DUP }; SWAP; DIP { DUP; CAR }; SWAP; DIP { CAR }; GET; IF_NONE { PUSH nat 0; DIP { EMPTY_MAP (address) nat }; PAIR; EMPTY_MAP (address) nat } { DUP; CDR }; DIP { DIP { DUP }; SWAP }; SWAP; CDR; CDR; DUP; INT; EQ; IF { DROP; NONE nat } { SOME }; DIP { DIP { DIP { DUP }; SWAP }; SWAP }; SWAP; CDR; CAR; UPDATE; DIP { DUP; DIP { CAR }; CDR }; DIP { DROP }; SWAP; PAIR; SWAP; CAR; DIP { SOME }; DIP { DIP { DUP; CAR } }; UPDATE; DIP { DUP; DIP { CDR }; CAR }; DIP { DROP }; PAIR } }; DIP { DUP }; SWAP; DIP { DUP }; SWAP; CDR; CAR; DIP { CAR }; GET; IF_NONE { DUP; CDR; CDR; INT; EQ; IF { NONE (pair nat (map address nat)) } { DUP; CDR; CDR; DIP { EMPTY_MAP (address) nat }; PAIR; SOME } } { DIP { DUP }; SWAP; CDR; CDR; DIP { DUP; CAR }; ADD; DIP { DUP; DIP { CDR }; CAR }; DIP { DROP }; PAIR; SOME }; SWAP; DUP; DIP { CDR; CAR; DIP { DIP { DUP; CAR } }; UPDATE; DIP { DUP; DIP { CDR }; CAR }; DIP { DROP }; PAIR }; DUP; DIP { CDR; CDR; INT; DIP { DUP; CDR; CDR; CDR }; ADD; ISNAT; IF_NONE { PUSH string "Internal: Negative total supply"; FAILWITH } {  }; DIP { DUP; CDR }; DIP { DUP; DIP { CAR }; CDR }; DIP { DUP; DIP { CAR }; CDR }; DIP { DROP }; SWAP; PAIR; SWAP; PAIR; DIP { DUP; DIP { CAR }; CDR }; DIP { DROP }; SWAP; PAIR }; DIP { DUP }; SWAP; DIP { DUP }; SWAP; CAR; DIP { CAR }; GET; IF_NONE { CDR; CDR; PUSH nat 0; SWAP; PAIR; PUSH string "NotEnoughBalance"; PAIR; FAILWITH } {  }; DUP; CAR; DIP { DIP { DUP }; SWAP }; SWAP; CDR; CDR; SWAP; SUB; ISNAT; IF_NONE { CAR; DIP { DUP }; SWAP; CDR; CDR; PAIR; PUSH string "NotEnoughBalance"; PAIR; FAILWITH } {  }; DIP { DUP; DIP { CDR }; CAR }; DIP { DROP }; PAIR; DIP { DUP }; SWAP; DIP { DUP; CAR; INT; EQ; IF { DUP; CDR; SIZE; INT; EQ; IF { DROP; NONE (pair nat (map address nat)) } { SOME } } { SOME }; SWAP; CAR; DIP { DIP { DUP; CAR } }; UPDATE; DIP { DUP; DIP { CDR }; CAR }; DIP { DROP }; PAIR }; DUP; DIP { CDR; CDR; NEG; DIP { DUP; CDR; CDR; CDR }; ADD; ISNAT; IF_NONE { PUSH string "Internal: Negative total supply"; FAILWITH } {  }; DIP { DUP; CDR }; DIP { DUP; DIP { CAR }; CDR }; DIP { DUP; DIP { CAR }; CDR }; DIP { DROP }; SWAP; PAIR; SWAP; PAIR; DIP { DUP; DIP { CAR }; CDR }; DIP { DROP }; SWAP; PAIR }; DROP }; NIL operation; PAIR } { SENDER; PAIR; DIP { DUP; CDR; CDR; CAR; IF { UNIT; PUSH string "TokenOperationsArePaused"; PAIR; FAILWITH } {  } }; DIP { DUP }; SWAP; DIP { DUP }; SWAP; DUP; DIP { CAR; DIP { CAR }; GET; IF_NONE { EMPTY_MAP (address) nat } { CDR } }; CDR; CAR; GET; IF_NONE { PUSH nat 0 } {  }; DUP; INT; EQ; IF { DROP } { DIP { DUP }; SWAP; CDR; CDR; INT; EQ; IF { DROP } { PUSH string "UnsafeAllowanceChange"; PAIR; FAILWITH } }; DIP { DUP }; SWAP; DIP { DUP; CAR }; SWAP; DIP { CAR }; GET; IF_NONE { PUSH nat 0; DIP { EMPTY_MAP (address) nat }; PAIR; EMPTY_MAP (address) nat } { DUP; CDR }; DIP { DIP { DUP }; SWAP }; SWAP; CDR; CDR; DUP; INT; EQ; IF { DROP; NONE nat } { SOME }; DIP { DIP { DIP { DUP }; SWAP }; SWAP }; SWAP; CDR; CAR; UPDATE; DIP { DUP; DIP { CAR }; CDR }; DIP { DROP }; SWAP; PAIR; SWAP; CAR; DIP { SOME }; DIP { DIP { DUP; CAR } }; UPDATE; DIP { DUP; DIP { CDR }; CAR }; DIP { DROP }; PAIR; NIL operation; PAIR } } { IF_LEFT { DUP; CAR; DIP { CDR }; DIP { DIP { DUP }; SWAP }; PAIR; DUP; CAR; DIP { CDR }; DUP; DIP { CAR; DIP { CAR }; GET; IF_NONE { EMPTY_MAP (address) nat } { CDR } }; CDR; GET; IF_NONE { PUSH nat 0 } {  }; DIP { AMOUNT }; TRANSFER_TOKENS; NIL operation; SWAP; CONS; PAIR } { IF_LEFT { DUP; CAR; DIP { CDR }; DIP { DIP { DUP }; SWAP }; PAIR; DUP; CAR; DIP { CDR }; DIP { CAR }; GET; IF_NONE { PUSH nat 0 } { CAR }; DIP { AMOUNT }; TRANSFER_TOKENS; NIL operation; SWAP; CONS; PAIR } { DUP; CAR; DIP { CDR }; DIP { DIP { DUP }; SWAP }; PAIR; CDR; CDR; CDR; CDR; DIP { AMOUNT }; TRANSFER_TOKENS; NIL operation; SWAP; CONS; PAIR } } } } { IF_LEFT { IF_LEFT { DIP { DUP; CDR; CAR; SENDER; COMPARE; EQ; IF {  } { UNIT; PUSH string "SenderIsNotAdmin"; PAIR; FAILWITH } }; DIP { DUP; CDR }; DIP { DUP; DIP { CAR }; CDR }; DIP { DUP; DIP { CDR }; CAR }; DIP { DROP }; PAIR; SWAP; PAIR; DIP { DUP; DIP { CAR }; CDR }; DIP { DROP }; SWAP; PAIR; NIL operation; PAIR } { DIP { DUP; CDR; CAR; SENDER; COMPARE; EQ; IF {  } { UNIT; PUSH string "SenderIsNotAdmin"; PAIR; FAILWITH } }; DIP { DUP; CDR }; DIP { DUP; DIP { CDR }; CAR }; DIP { DROP }; PAIR; DIP { DUP; DIP { CAR }; CDR }; DIP { DROP }; SWAP; PAIR; NIL operation; PAIR } } { IF_LEFT { DUP; CAR; DIP { CDR }; DIP { DIP { DUP }; SWAP }; PAIR; CDR; CDR; CAR; DIP { AMOUNT }; TRANSFER_TOKENS; NIL operation; SWAP; CONS; PAIR } { IF_LEFT { DIP { DUP; CDR; CAR; SENDER; COMPARE; EQ; IF {  } { UNIT; PUSH string "SenderIsNotAdmin"; PAIR; FAILWITH } }; DIP { DUP }; SWAP; DIP { DUP }; SWAP; CAR; DIP { CAR }; GET; IF_NONE { DUP; CDR; INT; EQ; IF { NONE (pair nat (map address nat)) } { DUP; CDR; DIP { EMPTY_MAP (address) nat }; PAIR; SOME } } { DIP { DUP }; SWAP; CDR; DIP { DUP; CAR }; ADD; DIP { DUP; DIP { CDR }; CAR }; DIP { DROP }; PAIR; SOME }; SWAP; DUP; DIP { CAR; DIP { DIP { DUP; CAR } }; UPDATE; DIP { DUP; DIP { CDR }; CAR }; DIP { DROP }; PAIR }; DUP; DIP { CDR; INT; DIP { DUP; CDR; CDR; CDR }; ADD; ISNAT; IF_NONE { PUSH string "Internal: Negative total supply"; FAILWITH } {  }; DIP { DUP; CDR }; DIP { DUP; DIP { CAR }; CDR }; DIP { DUP; DIP { CAR }; CDR }; DIP { DROP }; SWAP; PAIR; SWAP; PAIR; DIP { DUP; DIP { CAR }; CDR }; DIP { DROP }; SWAP; PAIR }; DROP; NIL operation; PAIR } { DIP { DUP; CDR; CAR; SENDER; COMPARE; EQ; IF {  } { UNIT; PUSH string "SenderIsNotAdmin"; PAIR; FAILWITH } }; DIP { DUP }; SWAP; DIP { DUP }; SWAP; CAR; DIP { CAR }; GET; IF_NONE { CDR; PUSH nat 0; SWAP; PAIR; PUSH string "NotEnoughBalance"; PAIR; FAILWITH } {  }; DUP; CAR; DIP { DIP { DUP }; SWAP }; SWAP; CDR; SWAP; SUB; ISNAT; IF_NONE { CAR; DIP { DUP }; SWAP; CDR; PAIR; PUSH string "NotEnoughBalance"; PAIR; FAILWITH } {  }; DIP { DUP; DIP { CDR }; CAR }; DIP { DROP }; PAIR; DIP { DUP }; SWAP; DIP { DUP; CAR; INT; EQ; IF { DUP; CDR; SIZE; INT; EQ; IF { DROP; NONE (pair nat (map address nat)) } { SOME } } { SOME }; SWAP; CAR; DIP { DIP { DUP; CAR } }; UPDATE; DIP { DUP; DIP { CDR }; CAR }; DIP { DROP }; PAIR }; DUP; DIP { CDR; NEG; DIP { DUP; CDR; CDR; CDR }; ADD; ISNAT; IF_NONE { PUSH string "Internal: Negative total supply"; FAILWITH } {  }; DIP { DUP; CDR }; DIP { DUP; DIP { CAR }; CDR }; DIP { DUP; DIP { CAR }; CDR }; DIP { DROP }; SWAP; PAIR; SWAP; PAIR; DIP { DUP; DIP { CAR }; CDR }; DIP { DROP }; SWAP; PAIR }; DROP; NIL operation; PAIR } } } } };`;
        const storage = `Pair {} (Pair "${administrator}" (Pair ${pause ? 'True' : 'False'} ${supply}))`;

        const nodeResult = await TezosNodeWriter.sendContractOriginationOperation(server, keystore, 0, undefined, fee, '', freight, gas, contract, storage, TezosTypes.TezosParameterFormat.Michelson);
        return clearRPCOperationGroupHash(nodeResult['operationGroupID']);
    }

    export async function getAccountBalance(server: string, mapid: number, account: string): Promise<number> {
        const packedKey = TezosMessageUtils.encodeBigMapKey(Buffer.from(TezosMessageUtils.writePackedData(account, 'address'), 'hex'));
        const mapResult = await TezosNodeReader.getValueForBigMapKey(server, mapid, packedKey);

        if (mapResult === undefined) { throw new Error(`Map ${mapid} does not contain a record for ${account}`); }
    
        const jsonresult = JSONPath({ path: '$.args[0].int', json: mapResult });
        return Number(jsonresult[0]);
    }

    export async function getAccountAllowance(server: string, mapid: number, account: string, source: string) {
        const packedKey = TezosMessageUtils.encodeBigMapKey(Buffer.from(TezosMessageUtils.writePackedData(source, 'address'), 'hex'));
        const mapResult = await TezosNodeReader.getValueForBigMapKey(server, mapid, packedKey);

        if (mapResult === undefined) { throw new Error(`Map ${mapid} does not contain a record for ${source}/${account}`); }

        let allowances = new Map<string, number>();
        JSONPath({ path: '$.args[1][*].args', json: mapResult }).forEach(v => allowances[v[0]['string']] = Number(v[1]['int']));

        return allowances[account];
    }

    export async function getSimpleStorage(server: string, address: string): Promise<{mapid: number, supply: number, administrator: string, paused: boolean}> {
        const storageResult = await TezosNodeReader.getContractStorage(server, address);

        return {
            mapid: Number(JSONPath({ path: '$.args[0].int', json: storageResult })[0]),
            supply: Number(JSONPath({ path: '$.args[1].args[1].args[1].int', json: storageResult })[0]),
            administrator: JSONPath({ path: '$.args[1].args[0].string', json: storageResult })[0],
            paused: (JSONPath({ path: '$.args[1].args[1].args[0].prim', json: storageResult })[0]).toString().toLowerCase().startsWith('t')
        };
    }

    export async function getTokenSupply(server: string, address: string): Promise<number> {
        const storageResult = await TezosNodeReader.getContractStorage(server, address);

        return Number(JSONPath({ path: '$.args[1].args[1].args[1].int', json: storageResult })[0]);
    }

    export async function getAdministrator(server: string, address: string): Promise<string> {
        const storageResult = await TezosNodeReader.getContractStorage(server, address);

        return JSONPath({ path: '$.args[1].args[0].string', json: storageResult })[0];
    }

    export async function getPaused(server: string, address: string): Promise<boolean> {
        const storageResult = await TezosNodeReader.getContractStorage(server, address);

        return (JSONPath({ path: '$.args[1].args[1].args[0].prim', json: storageResult })[0]).toString().toLowerCase().startsWith('t');
    }

    export async function transferBalance(server: string, keystore: KeyStore, contract: string, fee: number, source: string, destination: string, amount: number, gas: number, freight: number) {
        const parameters = `(Left (Left (Left (Pair "${source}" (Pair "${destination}" ${amount})))))`;

        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(server, keystore, contract, 0, fee, keystore.derivationPath, freight, gas, '', parameters, TezosTypes.TezosParameterFormat.Michelson);

        return clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }

    export async function approveBalance(server: string, keystore: KeyStore, contract: string, fee: number, destination: string, amount: number, gas: number, freight: number) {
        const parameters = `(Left (Left (Right (Pair "${destination}" ${amount}))))`;

        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(server, keystore, contract, 0, fee, keystore.derivationPath, freight, gas, '', parameters, TezosTypes.TezosParameterFormat.Michelson);

        return clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }

    export async function activateLedger(server: string, keystore: KeyStore, contract: string, fee: number, gas: number, freight: number) {
        const parameters = '(Right (Left (Left False)))';

        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(server, keystore, contract, 0, fee, keystore.derivationPath, freight, gas, '', parameters, TezosTypes.TezosParameterFormat.Michelson);

        return clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }

    export async function deactivateLedger(server: string, keystore: KeyStore, contract: string, fee: number, gas: number, freight: number) {
        const parameters = '(Right (Left (Left True)))';

        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(server, keystore, contract, 0, fee, keystore.derivationPath, freight, gas, '', parameters, TezosTypes.TezosParameterFormat.Michelson);

        return clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }

    export async function setAdministrator(server: string, keystore: KeyStore, contract: string, address: string, fee: number, gas: number, freight: number) {
        const parameters = `(Right (Left (Right "${address}")))`;

        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(server, keystore, contract, 0, fee, keystore.derivationPath, freight, gas, '', parameters, TezosTypes.TezosParameterFormat.Michelson);

        return clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }

    export async function mint(server: string, keystore: KeyStore, contract: string, fee: number, destination: string, amount: number, gas: number = 150_000, freight: number = 5_000) {
        const parameters = `(Right (Right (Right (Left (Pair "${destination}" ${amount})))))`;

        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(server, keystore, contract, 0, fee, keystore.derivationPath, freight, gas, '', parameters, TezosTypes.TezosParameterFormat.Michelson);

        return clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }

    export async function burn(server: string, keystore: KeyStore, contract: string, fee: number, source: string, amount: number, gas: number, freight: number) {
        const parameters = `(Right (Right (Right (Right (Pair "${source}" ${amount})))))`;

        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(server, keystore, contract, 0, fee, keystore.derivationPath, freight, gas, '', parameters, TezosTypes.TezosParameterFormat.Michelson);

        return clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }

    function clearRPCOperationGroupHash(hash: string) {
        return hash.replace(/\"/g, '').replace(/\n/, '');
    }
}

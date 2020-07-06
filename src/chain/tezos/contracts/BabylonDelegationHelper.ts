import { JSONPath } from 'jsonpath-plus';

import { KeyStore, Signer } from '../../../types/ExternalInterfaces';
import * as TezosTypes from '../../../types/tezos/TezosChainTypes';
import { TezosConstants } from '../../../types/tezos/TezosConstants';
import { TezosNodeReader } from '../TezosNodeReader';
import { TezosNodeWriter } from '../TezosNodeWriter';
import { TezosContractUtils } from './TezosContractUtils';

export namespace BabylonDelegationHelper {
    /**
     * Gets the contract code at the specified address at the head block and compares it to the known hash of the code. This function processes Micheline format contracts.
     * 
     * @param server Destination Tezos node.
     * @param address Contract address to query.
     */
    export async function verifyDestination(server: string, address: string): Promise<boolean> {
        return TezosContractUtils.verifyDestination(server, address, 'd99cb8b4c7e40166f59c0f3c30724225');
    }

    /**
     * In contrast to verifyDestination, this function uses compares Michelson hashes.
     * 
     * @param script 
     */
    export function verifyScript(script: string): boolean {
        return TezosContractUtils.verifyScript(script, 'a585489ffaee60d07077059539d5bfc8');
    }

    export async function getSimpleStorage(server: string, address: string): Promise<{administrator: string}> {
        const storageResult = await TezosNodeReader.getContractStorage(server, address);

        return { administrator: JSONPath({ path: '$.string', json: storageResult })[0] };
    }

    /**
     * 
     * @param server Destination Tezos node.
     * @param keyStore Key pair to sign the transaction.
     * @param delegator KT1 address of the delegated account that `keyStore.publicKeyHash` controls.
     * @param delegate
     * @param fee Operation fee in µtz.
     * @param derivationPath Derivation path, necessary if signing with a Ledger device.
     */
    export function setDelegate(server: string, signer: Signer, keyStore: KeyStore, contract: string, delegate: string, fee: number): Promise<TezosTypes.OperationResult> {
        if (contract.startsWith('KT1')) {
            //const parameters = `{ DROP ; NIL operation ; PUSH key_hash "${delegate}" ; SOME ; SET_DELEGATE ; CONS }`;
            const parameters = `[{ "prim": "DROP" }, { "prim": "NIL", "args": [{ "prim": "operation" }] }, { "prim": "PUSH", "args": [{ "prim": "key_hash" }, { "string": "${delegate}" } ] }, { "prim": "SOME" }, { "prim": "SET_DELEGATE" }, { "prim": "CONS" } ]`;

            return TezosNodeWriter.sendContractInvocationOperation(server, signer, keyStore, contract, 0, fee, 0, TezosConstants.P005ManagerContractWithdrawalGasLimit, 'do', parameters, TezosTypes.TezosParameterFormat.Micheline);
        } else { 
            return TezosNodeWriter.sendDelegationOperation(server, signer, keyStore, delegate, fee);
        }
    }

    /**
     * 
     * @param server Destination Tezos node.
     * @param keyStore Key pair to sign the transaction.
     * @param contract KT1 address of the delegated account that `keyStore.publicKeyHash` controls.
     * @param fee Operation fee in µtz.
     * @param derivationPath Derivation path, necessary if signing with a Ledger device.
     */
    export function unSetDelegate(server: string, signer: Signer, keyStore: KeyStore, contract: string, fee: number): Promise<TezosTypes.OperationResult> {
        if (contract.startsWith('KT1')) {
            //const parameters = '{ DROP ; NIL operation ; NONE key_hash ; SET_DELEGATE ; CONS }';
            const parameters = `[{ "prim": "DROP" }, { "prim": "NIL", "args": [{ "prim": "operation" }] }, { "prim": "NONE", "args": [{ "prim": "key_hash" }] }, { "prim": "SET_DELEGATE" }, { "prim": "CONS" } ]`;

            return TezosNodeWriter.sendContractInvocationOperation(server, signer, keyStore, contract, 0, fee, 0, TezosConstants.P005ManagerContractWithdrawalGasLimit, 'do', parameters, TezosTypes.TezosParameterFormat.Micheline);
        } else {
            return TezosNodeWriter.sendUndelegationOperation(server, signer, keyStore, fee);
        }
    }

    /**
     * Allows withdrawal of funds from pre-protocol 005 KT1 delegated accounts into what used be referred to as the manager account.
     * 
     * @param server Destination Tezos node.
     * @param keyStore Key pair to sign the transaction.
     * @param contract KT1 address of the delegated account that `keyStore.publicKeyHash` controls.
     * @param fee Operation fee in µtz.
     * @param amount Amount to transfer in µtz.
     * @param derivationPath Derivation path, necessary if signing with a Ledger device.
     */
    export function withdrawDelegatedFunds(server: string, signer: Signer, keyStore: KeyStore, contract: string, fee: number, amount: number): Promise<TezosTypes.OperationResult> {
        return sendDelegatedFunds(server, signer, keyStore, contract, fee, amount, keyStore.publicKeyHash);
    }

    /**
     * Allows sending funds from pre-protocol 005 KT1 delegated accounts to other accounts.
     * 
     * @param server Destination Tezos node.
     * @param keyStore Key pair to sign the transaction.
     * @param contract KT1 address of the delegated account that `keyStore.publicKeyHash` controls.
     * @param fee Operation fee in µtz.
     * @param amount Amount to transfer in µtz.
     * @param derivationPath Derivation path, necessary if signing with a Ledger device.
     * @param destination 
     */
    export function sendDelegatedFunds(server: string, signer: Signer, keyStore: KeyStore, contract: string, fee: number, amount: number, destination: string): Promise<TezosTypes.OperationResult> {
        let parameters =
         `[ { "prim": "DROP" },
            { "prim": "NIL", "args": [ { "prim": "operation" } ] },
            { "prim": "PUSH", "args": [ { "prim": "key_hash" }, { "string": "${destination}" } ] },
            { "prim": "IMPLICIT_ACCOUNT" },
            { "prim": "PUSH", "args": [ { "prim": "mutez" }, { "int": "${amount}" } ] },
            { "prim": "UNIT" },
            { "prim": "TRANSFER_TOKENS" },
            { "prim": "CONS" } ]`;

        return TezosNodeWriter.sendContractInvocationOperation(server, signer, keyStore, contract, 0, fee, TezosConstants.P005ManagerContractWithdrawalStorageLimit, TezosConstants.P005ManagerContractWithdrawalGasLimit, 'do', parameters, TezosTypes.TezosParameterFormat.Micheline);
    }

    /**
     * Allows deposit of funds into a pre-protocol 005 KT1 delegated accounts.
     * 
     * @param server Destination Tezos node.
     * @param keyStore Key pair to sign the transaction.
     * @param contract KT1 address of the delegated account that `keyStore.publicKeyHash` controls.
     * @param fee Operation fee in µtz.
     * @param amount Amount to transfer in µtz.
     * @param derivationPath Derivation path, necessary if signing with a Ledger device.
     */
    export function depositDelegatedFunds(server: string, signer: Signer, keyStore: KeyStore, contract: string, fee: number, amount: number): Promise<TezosTypes.OperationResult> {
        return TezosNodeWriter.sendContractInvocationOperation(server, signer, keyStore, contract, amount, fee, 0, TezosConstants.P005ManagerContractDepositGasLimit, undefined, undefined);
    }

    export function deployManagerContract(server: string, signer: Signer, keyStore: KeyStore, delegate: string, fee: number, amount: number): Promise<TezosTypes.OperationResult> {
        const code = `[ { "prim": "parameter",
        "args":
          [ { "prim": "or",
              "args":
                [ { "prim": "lambda",
                    "args":
                      [ { "prim": "unit" }, { "prim": "list", "args": [ { "prim": "operation" } ] } ], "annots": [ "%do" ] },
                  { "prim": "unit", "annots": [ "%default" ] } ] } ] },
      { "prim": "storage", "args": [ { "prim": "key_hash" } ] },
      { "prim": "code",
        "args":
          [ [ [ [ { "prim": "DUP" }, { "prim": "CAR" },
                  { "prim": "DIP", "args": [ [ { "prim": "CDR" } ] ] } ] ],
              { "prim": "IF_LEFT",
                "args":
                  [ [ { "prim": "PUSH", "args": [ { "prim": "mutez" }, { "int": "0" } ] },
                      { "prim": "AMOUNT" },
                      [ [ { "prim": "COMPARE" }, { "prim": "EQ" } ],
                        { "prim": "IF", "args": [ [], [ [ { "prim": "UNIT" }, { "prim": "FAILWITH" } ] ] ] } ],
                      [ { "prim": "DIP", "args": [ [ { "prim": "DUP" } ] ] },
                        { "prim": "SWAP" } ],
                      { "prim": "IMPLICIT_ACCOUNT" },
                      { "prim": "ADDRESS" },
                      { "prim": "SENDER" },
                      [ [ { "prim": "COMPARE" }, { "prim": "EQ" } ],
                        { "prim": "IF", "args": [ [], [ [ { "prim": "UNIT" },{ "prim": "FAILWITH" } ] ] ] } ],
                      { "prim": "UNIT" }, { "prim": "EXEC" },
                      { "prim": "PAIR" } ],
                    [ { "prim": "DROP" },
                      { "prim": "NIL", "args": [ { "prim": "operation" } ] },
                      { "prim": "PAIR" } ] ] } ] ] } ]`;
        const storage = `{ "string": "${keyStore.publicKeyHash}" }`;

        return TezosNodeWriter.sendContractOriginationOperation(server, signer, keyStore, amount, delegate, fee, 600, 20000, code, storage, TezosTypes.TezosParameterFormat.Micheline);
    }
}

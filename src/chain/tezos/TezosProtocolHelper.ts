import { KeyStore } from '../../types/wallet/KeyStore';
import * as TezosTypes from '../../types/tezos/TezosChainTypes';
import { TezosConstants } from '../../types/tezos/TezosConstants';
import { TezosNodeWriter } from './TezosNodeWriter';

/**
 * Code here should be considered deprecated. It exists to simplify transition between Tezos protocol versions.
 */
export namespace TezosProtocolHelper {
    /**
     * 
     * @param server Destination Tezos node.
     * @param keyStore Key pair to sign the transaction.
     * @param delegator KT1 address of the delegated account that `keyStore.publicKeyHash` controls.
     * @param delegate
     * @param fee Operation fee in µtz.
     * @param derivationPath Derivation path, necessary if signing with a Ledger device.
     */
    export function setDelegate(server: string, keyStore: KeyStore, delegator: string, delegate: string, fee: number, derivationPath: string = ''): Promise<TezosTypes.OperationResult> {
        if (delegator.startsWith('KT1')) {
            //const parameters = `{ DROP ; NIL operation ; PUSH key_hash "${delegate}" ; SOME ; SET_DELEGATE ; CONS }`;
            const parameters = `[{ "prim": "DROP" }, { "prim": "NIL", "args": [{ "prim": "operation" }] }, { "prim": "PUSH", "args": [{ "prim": "key_hash" }, { "string": "${delegate}" } ] }, { "prim": "SOME" }, { "prim": "SET_DELEGATE" }, { "prim": "CONS" } ]`;

            return TezosNodeWriter.sendContractInvocationOperation(server, keyStore, delegator, 0, fee, derivationPath, 0, TezosConstants.P005ManagerContractWithdrawalGasLimit, 'do', parameters, TezosTypes.TezosParameterFormat.Micheline);
        } else { 
            return TezosNodeWriter.sendDelegationOperation(server, keyStore, delegate, fee, derivationPath);
        }
    }

    /**
     * 
     * @param server Destination Tezos node.
     * @param keyStore Key pair to sign the transaction.
     * @param delegator KT1 address of the delegated account that `keyStore.publicKeyHash` controls.
     * @param fee Operation fee in µtz.
     * @param derivationPath Derivation path, necessary if signing with a Ledger device.
     */
    export function unSetDelegate(server: string, keyStore: KeyStore, delegator: string, fee: number, derivationPath: string = ''): Promise<TezosTypes.OperationResult> {
        if (delegator.startsWith('KT1')) {
            //const parameters = '{ DROP ; NIL operation ; NONE key_hash ; SET_DELEGATE ; CONS }';
            const parameters = `[{ "prim": "DROP" }, { "prim": "NIL", "args": [{ "prim": "operation" }] }, { "prim": "NONE", "args": [{ "prim": "key_hash" }] }, { "prim": "SET_DELEGATE" }, { "prim": "CONS" } ]`;

            return TezosNodeWriter.sendContractInvocationOperation(server, keyStore, delegator, 0, fee, derivationPath, 0, TezosConstants.P005ManagerContractWithdrawalGasLimit, 'do', parameters, TezosTypes.TezosParameterFormat.Micheline);
        } else {
            return TezosNodeWriter.sendUndelegationOperation(server, keyStore, fee, derivationPath);
        }
    }

    /**
     * Allows withdrawal of funds from pre-protocol 005 KT1 delegated accounts into what used be referred to as the manager account.
     * 
     * @param server Destination Tezos node.
     * @param keyStore Key pair to sign the transaction.
     * @param delegator KT1 address of the delegated account that `keyStore.publicKeyHash` controls.
     * @param fee Operation fee in µtz.
     * @param amount Amount to transfer in µtz.
     * @param derivationPath Derivation path, necessary if signing with a Ledger device.
     */
    export function withdrawDelegatedFunds(server: string, keyStore: KeyStore, delegator: string, fee: number, amount: number, derivationPath: string = ''): Promise<TezosTypes.OperationResult> {
        let parameters =
         `[ { "prim": "DROP" },
            { "prim": "NIL", "args": [ { "prim": "operation" } ] },
            { "prim": "PUSH", "args": [ { "prim": "key_hash" }, { "string": "${keyStore.publicKeyHash}" } ] },
            { "prim": "IMPLICIT_ACCOUNT" },
            { "prim": "PUSH", "args": [ { "prim": "mutez" }, { "int": "${amount}" } ] },
            { "prim": "UNIT" },
            { "prim": "TRANSFER_TOKENS" },
            { "prim": "CONS" } ]`;

        return TezosNodeWriter.sendContractInvocationOperation(server, keyStore, delegator, 0, fee, derivationPath, 0, TezosConstants.P005ManagerContractWithdrawalGasLimit, 'do', parameters, TezosTypes.TezosParameterFormat.Micheline);
    }

    /**
     * Allows deposit of funds from pre-protocol 005 KT1 delegated accounts into what used be referred to as the manager account.
     * 
     * @param server Destination Tezos node.
     * @param keyStore Key pair to sign the transaction.
     * @param delegator KT1 address of the delegated account that `keyStore.publicKeyHash` controls.
     * @param fee Operation fee in µtz.
     * @param amount Amount to transfer in µtz.
     * @param derivationPath Derivation path, necessary if signing with a Ledger device.
     */
    export function depositDelegatedFunds(server: string, keyStore: KeyStore, delegator: string, fee: number, amount: number, derivationPath: string = ''): Promise<TezosTypes.OperationResult> {
        return TezosNodeWriter.sendContractInvocationOperation(server, keyStore, delegator, amount, fee, derivationPath, 0, TezosConstants.P005ManagerContractDepositGasLimit, undefined, undefined);
    }

    export function deployManagerContract(server: string, keyStore: KeyStore, delegate: string, fee: number, amount: number, derivationPath: string = ''): Promise<TezosTypes.OperationResult> {
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

        return TezosNodeWriter.sendContractOriginationOperation(server, keyStore, amount, delegate, fee, derivationPath, 600, 20000, code, storage, TezosTypes.TezosParameterFormat.Micheline);
    }
}

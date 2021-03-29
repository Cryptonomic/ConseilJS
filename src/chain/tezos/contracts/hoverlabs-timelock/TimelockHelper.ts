import { JSONPath } from 'jsonpath-plus';
import { Signer, KeyStore } from '../../../../types/ExternalInterfaces';
import { TezosParameterFormat } from '../../../../types/tezos/TezosChainTypes';
import { TezosNodeReader } from '../../TezosNodeReader';
import { TezosNodeWriter } from '../../TezosNodeWriter';
import { TezosContractUtils } from '../TezosContractUtils';

export namespace TimelockHelper {

    /*
     * Timelock multisig contract storage type
     */
    export interface Storage {
        operationId: number;
        keys: string[];
        threshold: number;
        mapid: number;
        timelockSeconds: number;
    }

    /*
     * Timelock multisig contract deployment parameters
     */
    export interface DeployPair {
        keys: string[];
        threshold: number;
        timelockSeconds: number;
    }

    /*
     * Returns a DeployPair in Michelson format
     * @param deploy
     */
    export function DeployPairMichelson(deploy: DeployPair): string {
        // Tezos requires keys to be sorted alphabetically, according to hoverlabds timelock CLI:
        // https://github.com/Hover-Labs/multisig-timelock/blob/main/cli/src/commands.ts#L212
        let keyList: string = deploy.keys.sort().reduce((prev: string, curr: string) => { return `${prev} "${curr}"`; });
        return `(Pair(Pair 0 { ${keyList} }) (Pair ${deploy.threshold} (Pair { } ${deploy.timelockSeconds})))`;
    }

    /*
     * Returns a DeployPair in Micheline format
     * @param deploy
     */
    export function DeployPairMicheline(deploy: DeployPair): string {
        // Tezos requires keys to be sorted alphabetically, according to hoverlabds timelock CLI:
        // https://github.com/Hover-Labs/multisig-timelock/blob/main/cli/src/commands.ts#L212
        let keyList: string = deploy.keys.sort().map(k => `{ "string": "${k}" }`).join(',\n');
        return `{
        "prim": "Pair",
            "args": [
                {
                    "prim": "Pair",
                    "args": [
                        { "int": "0" },
                        [ ${keyList} ]
                    ]
                },
                { "prim": "Pair", "args": [ { "int": "${deploy.threshold}" }, { "prim": "Pair", "args": [ [], { "int": "${deploy.timelockSeconds}" } ] } ] }
            ]
        }`;
    }

    /*
     * Deploy a timelock contract with the specified parameters
     * @param server The Tezos node to communicate with
     * @param deploy A DeployPair object with the deployment parameters
     */
    export async function Deploy(server: string, signer: Signer, keystore: KeyStore, deploy: DeployPair, amount: number, fee: number, gas: number, freight: number): Promise<string> {
        const code: string = `[
            {
              "prim": "storage",
              "args": [
                {
                  "prim": "pair",
                  "args": [
                    { "prim": "pair", "args": [ { "prim": "nat", "annots": [ "%operationId" ] }, { "prim": "list", "args": [ { "prim": "key" } ], "annots": [ "%signers" ] } ] },
                    {
                      "prim": "pair",
                      "args": [
                        { "prim": "nat", "annots": [ "%threshold" ] },
                        {
                          "prim": "pair",
                          "args": [
                            {
                              "prim": "big_map",
                              "args": [
                                { "prim": "nat" },
                                {
                                  "prim": "pair",
                                  "args": [ { "prim": "timestamp" }, { "prim": "lambda", "args": [ { "prim": "unit" }, { "prim": "list", "args": [ { "prim": "operation" } ] } ] } ]
                                }
                              ],
                              "annots": [ "%timelock" ]
                            },
                            { "prim": "nat", "annots": [ "%timelockSeconds" ] }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              "prim": "parameter",
              "args": [
                {
                  "prim": "or",
                  "args": [
                    {
                      "prim": "or",
                      "args": [
                        {
                          "prim": "pair",
                          "args": [
                            { "prim": "map", "args": [ { "prim": "key_hash" }, { "prim": "signature" } ] },
                            { "prim": "pair", "args": [ { "prim": "chain_id" }, { "prim": "pair", "args": [ { "prim": "nat" }, { "prim": "nat" } ] } ] }
                          ],
                          "annots": [ "%cancel" ]
                        },
                        { "prim": "nat", "annots": [ "%execute" ] }
                      ]
                    },
                    {
                      "prim": "or",
                      "args": [
                        {
                          "prim": "pair",
                          "args": [
                            { "prim": "map", "args": [ { "prim": "key_hash" }, { "prim": "signature" } ] },
                            {
                              "prim": "pair",
                              "args": [
                                { "prim": "chain_id" },
                                { "prim": "pair", "args": [ { "prim": "nat" }, { "prim": "pair", "args": [ { "prim": "nat" }, { "prim": "list", "args": [ { "prim": "key" } ] } ] } ] }
                              ]
                            }
                          ],
                          "annots": [ "%rotate" ]
                        },
                        {
                          "prim": "pair",
                          "args": [
                            { "prim": "map", "args": [ { "prim": "key_hash" }, { "prim": "signature" } ] },
                            {
                              "prim": "pair",
                              "args": [
                                { "prim": "chain_id" },
                                {
                                  "prim": "pair",
                                  "args": [ { "prim": "nat" }, { "prim": "lambda", "args": [ { "prim": "unit" }, { "prim": "list", "args": [ { "prim": "operation" } ] } ] } ]
                                }
                              ]
                            }
                          ],
                          "annots": [ "%submit" ]
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              "prim": "code",
              "args": [
                [
                  { "prim": "UNPAIR" },
                  {
                    "prim": "IF_LEFT",
                    "args": [
                      [
                        {
                          "prim": "IF_LEFT",
                          "args": [
                            [
                              { "prim": "DUP" },
                              { "prim": "UNPAIR" },
                              { "prim": "SWAP" },
                              { "prim": "DUP" },
                              { "prim": "DUG", "args": [ { "int": "2" } ] },
                              { "prim": "UNPAIR" },
                              { "prim": "SWAP" },
                              { "prim": "DUP" },
                              { "prim": "DUG", "args": [ { "int": "2" } ] },
                              { "prim": "UNPAIR" },
                              { "prim": "CHAIN_ID" },
                              { "prim": "PACK" },
                              { "prim": "DUP", "args": [ { "int": "4" } ] },
                              { "prim": "PACK" },
                              { "prim": "COMPARE" },
                              { "prim": "EQ" },
                              { "prim": "IF", "args": [ [], [ { "prim": "PUSH", "args": [ { "prim": "string" }, { "string": "BAD_CHAIN_ID" } ] }, { "prim": "FAILWITH" } ] ] },
                              { "prim": "PUSH", "args": [ { "prim": "nat" }, { "int": "1" } ] },
                              { "prim": "DUP", "args": [ { "int": "9" } ] },
                              { "prim": "CAR" },
                              { "prim": "CAR" },
                              { "prim": "ADD" },
                              { "prim": "SWAP" },
                              { "prim": "DUP" },
                              { "prim": "DUG", "args": [ { "int": "2" } ] },
                              { "prim": "COMPARE" },
                              { "prim": "EQ" },
                              { "prim": "IF", "args": [ [], [ { "prim": "PUSH", "args": [ { "prim": "string" }, { "string": "BAD_OP_ID" } ] }, { "prim": "FAILWITH" } ] ] },
                              { "prim": "PUSH", "args": [ { "prim": "nat" }, { "int": "0" } ] },
                              { "prim": "DUP", "args": [ { "int": "9" } ] },
                              { "prim": "CAR" },
                              { "prim": "CDR" },
                              {
                                "prim": "ITER",
                                "args": [
                                  [
                                    { "prim": "DUP", "args": [ { "int": "7" } ] },
                                    { "prim": "SWAP" },
                                    { "prim": "DUP" },
                                    { "prim": "DUG", "args": [ { "int": "2" } ] },
                                    { "prim": "HASH_KEY" },
                                    { "prim": "MEM" },
                                    {
                                      "prim": "IF",
                                      "args": [
                                        [
                                          { "prim": "DUP", "args": [ { "int": "8" } ] },
                                          { "prim": "PACK" },
                                          { "prim": "DUP", "args": [ { "int": "8" } ] },
                                          { "prim": "DUP", "args": [ { "int": "3" } ] },
                                          { "prim": "HASH_KEY" },
                                          { "prim": "GET" },
                                          { "prim": "IF_NONE", "args": [ [ { "prim": "PUSH", "args": [ { "prim": "int" }, { "int": "196" } ] }, { "prim": "FAILWITH" } ], [] ] },
                                          { "prim": "DIG", "args": [ { "int": "2" } ] },
                                          { "prim": "CHECK_SIGNATURE" },
                                          { "prim": "IF", "args": [ [], [ { "prim": "PUSH", "args": [ { "prim": "string" }, { "string": "BAD_SIGNATURE" } ] }, { "prim": "FAILWITH" } ] ] },
                                          { "prim": "PUSH", "args": [ { "prim": "nat" }, { "int": "1" } ] },
                                          { "prim": "ADD" }
                                        ],
                                        [ { "prim": "DROP" } ]
                                      ]
                                    }
                                  ]
                                ]
                              },
                              { "prim": "SWAP" },
                              { "prim": "DROP" },
                              { "prim": "DIG", "args": [ { "int": "2" } ] },
                              { "prim": "DROP" },
                              { "prim": "DIG", "args": [ { "int": "2" } ] },
                              { "prim": "DROP" },
                              { "prim": "DIG", "args": [ { "int": "2" } ] },
                              { "prim": "DROP" },
                              { "prim": "DIG", "args": [ { "int": "2" } ] },
                              { "prim": "DROP" },
                              { "prim": "DIG", "args": [ { "int": "2" } ] },
                              { "prim": "DROP" },
                              { "prim": "DUP", "args": [ { "int": "3" } ] },
                              { "prim": "GET", "args": [ { "int": "3" } ] },
                              { "prim": "SWAP" },
                              { "prim": "COMPARE" },
                              { "prim": "GE" },
                              { "prim": "IF", "args": [ [], [ { "prim": "PUSH", "args": [ { "prim": "string" }, { "string": "TOO_FEW_SIGS" } ] }, { "prim": "FAILWITH" } ] ] },
                              { "prim": "SWAP" },
                              { "prim": "UNPAIR" },
                              { "prim": "UNPAIR" },
                              { "prim": "PUSH", "args": [ { "prim": "nat" }, { "int": "1" } ] },
                              { "prim": "ADD" },
                              { "prim": "PAIR" },
                              { "prim": "SWAP" },
                              { "prim": "UNPAIR" },
                              { "prim": "SWAP" },
                              { "prim": "UNPAIR" },
                              {
                                "prim": "NONE",
                                "args": [
                                  {
                                    "prim": "pair",
                                    "args": [ { "prim": "timestamp" }, { "prim": "lambda", "args": [ { "prim": "unit" }, { "prim": "list", "args": [ { "prim": "operation" } ] } ] } ]
                                  }
                                ]
                              },
                              { "prim": "DIG", "args": [ { "int": "5" } ] },
                              { "prim": "UPDATE" },
                              { "prim": "PAIR" },
                              { "prim": "SWAP" },
                              { "prim": "PAIR" },
                              { "prim": "SWAP" },
                              { "prim": "PAIR" },
                              { "prim": "NIL", "args": [ { "prim": "operation" } ] }
                            ],
                            [
                              { "prim": "SWAP" },
                              { "prim": "DUP" },
                              { "prim": "DUG", "args": [ { "int": "2" } ] },
                              { "prim": "GET", "args": [ { "int": "5" } ] },
                              { "prim": "SWAP" },
                              { "prim": "DUP" },
                              { "prim": "DUG", "args": [ { "int": "2" } ] },
                              { "prim": "GET" },
                              { "prim": "IF_NONE", "args": [ [ { "prim": "PUSH", "args": [ { "prim": "int" }, { "int": "214" } ] }, { "prim": "FAILWITH" } ], [] ] },
                              { "prim": "UNPAIR" },
                              { "prim": "NOW" },
                              { "prim": "SWAP" },
                              { "prim": "DUP", "args": [ { "int": "5" } ] },
                              { "prim": "GET", "args": [ { "int": "6" } ] },
                              { "prim": "INT" },
                              { "prim": "ADD" },
                              { "prim": "COMPARE" },
                              { "prim": "LT" },
                              { "prim": "IF", "args": [ [], [ { "prim": "PUSH", "args": [ { "prim": "string" }, { "string": "TOO_EARLY" } ] }, { "prim": "FAILWITH" } ] ] },
                              { "prim": "DIG", "args": [ { "int": "2" } ] },
                              { "prim": "UNPAIR" },
                              { "prim": "SWAP" },
                              { "prim": "UNPAIR" },
                              { "prim": "SWAP" },
                              { "prim": "UNPAIR" },
                              {
                                "prim": "NONE",
                                "args": [
                                  {
                                    "prim": "pair",
                                    "args": [ { "prim": "timestamp" }, { "prim": "lambda", "args": [ { "prim": "unit" }, { "prim": "list", "args": [ { "prim": "operation" } ] } ] } ]
                                  }
                                ]
                              },
                              { "prim": "DIG", "args": [ { "int": "6" } ] },
                              { "prim": "UPDATE" },
                              { "prim": "PAIR" },
                              { "prim": "SWAP" },
                              { "prim": "PAIR" },
                              { "prim": "SWAP" },
                              { "prim": "PAIR" },
                              { "prim": "SWAP" },
                              { "prim": "NIL", "args": [ { "prim": "operation" } ] },
                              { "prim": "SWAP" },
                              { "prim": "UNIT" },
                              { "prim": "EXEC" },
                              { "prim": "ITER", "args": [ [ { "prim": "CONS" } ] ] }
                            ]
                          ]
                        }
                      ],
                      [
                        {
                          "prim": "IF_LEFT",
                          "args": [
                            [
                              { "prim": "DUP" },
                              { "prim": "UNPAIR" },
                              { "prim": "SWAP" },
                              { "prim": "DUP" },
                              { "prim": "DUG", "args": [ { "int": "2" } ] },
                              { "prim": "UNPAIR" },
                              { "prim": "SWAP" },
                              { "prim": "DUP" },
                              { "prim": "DUG", "args": [ { "int": "2" } ] },
                              { "prim": "UNPAIR" },
                              { "prim": "CHAIN_ID" },
                              { "prim": "PACK" },
                              { "prim": "DUP", "args": [ { "int": "4" } ] },
                              { "prim": "PACK" },
                              { "prim": "COMPARE" },
                              { "prim": "EQ" },
                              { "prim": "IF", "args": [ [], [ { "prim": "PUSH", "args": [ { "prim": "string" }, { "string": "BAD_CHAIN_ID" } ] }, { "prim": "FAILWITH" } ] ] },
                              { "prim": "PUSH", "args": [ { "prim": "nat" }, { "int": "1" } ] },
                              { "prim": "DUP", "args": [ { "int": "9" } ] },
                              { "prim": "CAR" },
                              { "prim": "CAR" },
                              { "prim": "ADD" },
                              { "prim": "SWAP" },
                              { "prim": "DUP" },
                              { "prim": "DUG", "args": [ { "int": "2" } ] },
                              { "prim": "COMPARE" },
                              { "prim": "EQ" },
                              { "prim": "IF", "args": [ [], [ { "prim": "PUSH", "args": [ { "prim": "string" }, { "string": "BAD_OP_ID" } ] }, { "prim": "FAILWITH" } ] ] },
                              { "prim": "PUSH", "args": [ { "prim": "nat" }, { "int": "0" } ] },
                              { "prim": "DUP", "args": [ { "int": "9" } ] },
                              { "prim": "CAR" },
                              { "prim": "CDR" },
                              {
                                "prim": "ITER",
                                "args": [
                                  [
                                    { "prim": "DUP", "args": [ { "int": "7" } ] },
                                    { "prim": "SWAP" },
                                    { "prim": "DUP" },
                                    { "prim": "DUG", "args": [ { "int": "2" } ] },
                                    { "prim": "HASH_KEY" },
                                    { "prim": "MEM" },
                                    {
                                      "prim": "IF",
                                      "args": [
                                        [
                                          { "prim": "DUP", "args": [ { "int": "8" } ] },
                                          { "prim": "PACK" },
                                          { "prim": "DUP", "args": [ { "int": "8" } ] },
                                          { "prim": "DUP", "args": [ { "int": "3" } ] },
                                          { "prim": "HASH_KEY" },
                                          { "prim": "GET" },
                                          { "prim": "IF_NONE", "args": [ [ { "prim": "PUSH", "args": [ { "prim": "int" }, { "int": "157" } ] }, { "prim": "FAILWITH" } ], [] ] },
                                          { "prim": "DIG", "args": [ { "int": "2" } ] },
                                          { "prim": "CHECK_SIGNATURE" },
                                          { "prim": "IF", "args": [ [], [ { "prim": "PUSH", "args": [ { "prim": "string" }, { "string": "BAD_SIGNATURE" } ] }, { "prim": "FAILWITH" } ] ] },
                                          { "prim": "PUSH", "args": [ { "prim": "nat" }, { "int": "1" } ] },
                                          { "prim": "ADD" }
                                        ],
                                        [ { "prim": "DROP" } ]
                                      ]
                                    }
                                  ]
                                ]
                              },
                              { "prim": "SWAP" },
                              { "prim": "DROP" },
                              { "prim": "DIG", "args": [ { "int": "2" } ] },
                              { "prim": "DROP" },
                              { "prim": "DIG", "args": [ { "int": "2" } ] },
                              { "prim": "DROP" },
                              { "prim": "DIG", "args": [ { "int": "2" } ] },
                              { "prim": "DROP" },
                              { "prim": "DIG", "args": [ { "int": "2" } ] },
                              { "prim": "DROP" },
                              { "prim": "DIG", "args": [ { "int": "2" } ] },
                              { "prim": "DROP" },
                              { "prim": "DUP", "args": [ { "int": "3" } ] },
                              { "prim": "GET", "args": [ { "int": "3" } ] },
                              { "prim": "SWAP" },
                              { "prim": "COMPARE" },
                              { "prim": "GE" },
                              { "prim": "IF", "args": [ [], [ { "prim": "PUSH", "args": [ { "prim": "string" }, { "string": "TOO_FEW_SIGS" } ] }, { "prim": "FAILWITH" } ] ] },
                              { "prim": "SWAP" },
                              { "prim": "UNPAIR" },
                              { "prim": "UNPAIR" },
                              { "prim": "PUSH", "args": [ { "prim": "nat" }, { "int": "1" } ] },
                              { "prim": "ADD" },
                              { "prim": "PAIR" },
                              { "prim": "PAIR" },
                              { "prim": "SWAP" },
                              { "prim": "UNPAIR" },
                              { "prim": "DIG", "args": [ { "int": "2" } ] },
                              { "prim": "UNPAIR" },
                              { "prim": "SWAP" },
                              { "prim": "CDR" },
                              { "prim": "DIG", "args": [ { "int": "2" } ] },
                              { "prim": "PAIR" },
                              { "prim": "SWAP" },
                              { "prim": "CAR" },
                              { "prim": "DIG", "args": [ { "int": "2" } ] },
                              { "prim": "SWAP" },
                              { "prim": "PAIR" },
                              { "prim": "PAIR" }
                            ],
                            [
                              { "prim": "DUP" },
                              { "prim": "UNPAIR" },
                              { "prim": "SWAP" },
                              { "prim": "DUP" },
                              { "prim": "DUG", "args": [ { "int": "2" } ] },
                              { "prim": "UNPAIR" },
                              { "prim": "SWAP" },
                              { "prim": "DUP" },
                              { "prim": "DUG", "args": [ { "int": "2" } ] },
                              { "prim": "UNPAIR" },
                              { "prim": "CHAIN_ID" },
                              { "prim": "PACK" },
                              { "prim": "DUP", "args": [ { "int": "4" } ] },
                              { "prim": "PACK" },
                              { "prim": "COMPARE" },
                              { "prim": "EQ" },
                              { "prim": "IF", "args": [ [], [ { "prim": "PUSH", "args": [ { "prim": "string" }, { "string": "BAD_CHAIN_ID" } ] }, { "prim": "FAILWITH" } ] ] },
                              { "prim": "PUSH", "args": [ { "prim": "nat" }, { "int": "1" } ] },
                              { "prim": "DUP", "args": [ { "int": "9" } ] },
                              { "prim": "CAR" },
                              { "prim": "CAR" },
                              { "prim": "ADD" },
                              { "prim": "SWAP" },
                              { "prim": "DUP" },
                              { "prim": "DUG", "args": [ { "int": "2" } ] },
                              { "prim": "COMPARE" },
                              { "prim": "EQ" },
                              { "prim": "IF", "args": [ [], [ { "prim": "PUSH", "args": [ { "prim": "string" }, { "string": "BAD_OP_ID" } ] }, { "prim": "FAILWITH" } ] ] },
                              { "prim": "PUSH", "args": [ { "prim": "nat" }, { "int": "0" } ] },
                              { "prim": "DUP", "args": [ { "int": "9" } ] },
                              { "prim": "CAR" },
                              { "prim": "CDR" },
                              {
                                "prim": "ITER",
                                "args": [
                                  [
                                    { "prim": "DUP", "args": [ { "int": "7" } ] },
                                    { "prim": "SWAP" },
                                    { "prim": "DUP" },
                                    { "prim": "DUG", "args": [ { "int": "2" } ] },
                                    { "prim": "HASH_KEY" },
                                    { "prim": "MEM" },
                                    {
                                      "prim": "IF",
                                      "args": [
                                        [
                                          { "prim": "DUP", "args": [ { "int": "8" } ] },
                                          { "prim": "PACK" },
                                          { "prim": "DUP", "args": [ { "int": "8" } ] },
                                          { "prim": "DUP", "args": [ { "int": "3" } ] },
                                          { "prim": "HASH_KEY" },
                                          { "prim": "GET" },
                                          { "prim": "IF_NONE", "args": [ [ { "prim": "PUSH", "args": [ { "prim": "int" }, { "int": "120" } ] }, { "prim": "FAILWITH" } ], [] ] },
                                          { "prim": "DIG", "args": [ { "int": "2" } ] },
                                          { "prim": "CHECK_SIGNATURE" },
                                          { "prim": "IF", "args": [ [], [ { "prim": "PUSH", "args": [ { "prim": "string" }, { "string": "BAD_SIGNATURE" } ] }, { "prim": "FAILWITH" } ] ] },
                                          { "prim": "PUSH", "args": [ { "prim": "nat" }, { "int": "1" } ] },
                                          { "prim": "ADD" }
                                        ],
                                        [ { "prim": "DROP" } ]
                                      ]
                                    }
                                  ]
                                ]
                              },
                              { "prim": "SWAP" },
                              { "prim": "DROP" },
                              { "prim": "DIG", "args": [ { "int": "2" } ] },
                              { "prim": "DROP" },
                              { "prim": "DIG", "args": [ { "int": "2" } ] },
                              { "prim": "DROP" },
                              { "prim": "DIG", "args": [ { "int": "2" } ] },
                              { "prim": "DROP" },
                              { "prim": "DIG", "args": [ { "int": "2" } ] },
                              { "prim": "DROP" },
                              { "prim": "DIG", "args": [ { "int": "2" } ] },
                              { "prim": "DROP" },
                              { "prim": "DUP", "args": [ { "int": "3" } ] },
                              { "prim": "GET", "args": [ { "int": "3" } ] },
                              { "prim": "SWAP" },
                              { "prim": "COMPARE" },
                              { "prim": "GE" },
                              { "prim": "IF", "args": [ [], [ { "prim": "PUSH", "args": [ { "prim": "string" }, { "string": "TOO_FEW_SIGS" } ] }, { "prim": "FAILWITH" } ] ] },
                              { "prim": "SWAP" },
                              { "prim": "UNPAIR" },
                              { "prim": "UNPAIR" },
                              { "prim": "PUSH", "args": [ { "prim": "nat" }, { "int": "1" } ] },
                              { "prim": "ADD" },
                              { "prim": "PAIR" },
                              { "prim": "PAIR" },
                              { "prim": "DUP" },
                              { "prim": "DUG", "args": [ { "int": "2" } ] },
                              { "prim": "UNPAIR" },
                              { "prim": "SWAP" },
                              { "prim": "UNPAIR" },
                              { "prim": "SWAP" },
                              { "prim": "UNPAIR" },
                              { "prim": "DIG", "args": [ { "int": "4" } ] },
                              { "prim": "NOW" },
                              { "prim": "PAIR" },
                              { "prim": "SOME" },
                              { "prim": "DIG", "args": [ { "int": "5" } ] },
                              { "prim": "CAR" },
                              { "prim": "CAR" },
                              { "prim": "UPDATE" },
                              { "prim": "PAIR" },
                              { "prim": "SWAP" },
                              { "prim": "PAIR" },
                              { "prim": "SWAP" },
                              { "prim": "PAIR" }
                            ]
                          ]
                        },
                        { "prim": "NIL", "args": [ { "prim": "operation" } ] }
                      ]
                    ]
                  },
                  { "prim": "NIL", "args": [ { "prim": "operation" } ] },
                  { "prim": "SWAP" },
                  { "prim": "ITER", "args": [ [ { "prim": "CONS" } ] ] },
                  { "prim": "PAIR" }
                ]
              ]
            }
          ]`;
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
        return TezosContractUtils.clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }

    export type SignatureMap = { [address: string]: string}; // address -> signature map

    export function SignatureMapMicheline(signatures: SignatureMap): string {
        let signaturesMicheline = ``;
        for (let address in signatures) {
            signaturesMicheline += `{
                "prim": "Elt",
                "args": [
                  { "string": "${address}" },
                  { "string": "${signatures[address]}" }
                ]
            }, `;
        }
        if (signaturesMicheline.length > 0)
            signaturesMicheline = signaturesMicheline.slice(0, -1); // remove trailing comma
        return signaturesMicheline;
    }

    /* Submit entrypoint parameters
     *
     * @param chainid The chain id to execute on
     * @param operationId The current operation id of the contract
     * @param payload The lambda to execute
     */
    export interface SubmitPair {
        signatures: SignatureMap;
        chainId: string | undefined;
        operationId: number | undefined;
        payload: {
            lambda: string;
            lambdaType: TezosParameterFormat; // TODO: make sure this is the same as the invocation
        }
    }

    /*
     * Returns a SubmitPair in Micheline format
     * @param submit
     */
    export function SubmitPairMicheline(submit: SubmitPair): string {
        const exampleLambda: string = `[
          { "prim": "DROP" },
          { "prim": "NIL", "args": [ { "prim": "operation" } ] },
          { "prim": "PUSH", "args": [ { "prim": "address" }, { "string": "KT1Tezooo1zzSmartPyzzSTATiCzzzyfC8eF" } ] },
          { "prim": "CONTRACT", "args": [ { "prim": "nat" } ], "annots": [ "%replace" ] },
          { "prim": "IF_NONE", "args": [ [ { "prim": "PUSH", "args": [ { "prim": "int" }, { "int": "285" } ] }, { "prim": "FAILWITH" } ], [] ] },
          { "prim": "PUSH", "args": [ { "prim": "mutez" }, { "int": "0" } ] },
          { "prim": "PUSH", "args": [ { "prim": "nat" }, { "int": "1" } ] },
          { "prim": "TRANSFER_TOKENS" },
          { "prim": "CONS" }
        ]`;
        const signatures = SignatureMapMicheline(submit.signatures);
        return `{
            "prim": "Right",
            "args": [
              {
                "prim": "Right",
                "args": [
                  {
                    "prim": "Pair",
                    "args": [
                      [ ${signatures} ],
                      {
                        "prim": "Pair",
                        "args": [
                          { "bytes": "${submit.chainId}" },
                          {
                            "prim": "Pair",
                            "args": [
                              { "int": "${submit.operationId}" },
                              ${exampleLambda}
                            ]
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }`;
    }

    export async function Submit(server: string, signer: Signer, keystore: KeyStore, address: string, submit: SubmitPair, amount: number, fee: number, gas: number, freight: number): Promise<string> {
        const entrypoint = `submit`;

        // get chainId of mainnet if not specified
        if (!submit.chainId)
            submit.chainId = await TezosNodeReader.getChainId(server);

        // get current operationId if not specified
        if (!submit.operationId) {
            const storage = await getStorage(server, address);
            submit.operationId = storage.operationId;
        }

        let parameters: string = SubmitPairMicheline(submit);
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
        return TezosContractUtils.clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }

    /*
     * Rotate entrypoint parameters
     *
     * @param chainid The chain id to execute on
     * @param operationId The current operation id of the contract
     * @param payload The new threshold and set of keys
     */
    export interface RotatePair {
        signatures: SignatureMap;
        chainId: string | undefined;
        operationId: number | undefined;
        payload: {
            threshold: number;
            keys: string[];
        }
    }

    /*
     * Returns a RotatePair in Micheline format
     * @param rotate
     */
    export function RotatePairMicheline(rotate: RotatePair): string {
        return ``;
    }

    /*
     * Cancel entrypoint parameters
     *
     * @param chainid The chain id to execute operation
     * @param operationId The current operation id of the contract
     * @param timelockId The id of the operation to cancel
     */
    export interface CancelPair {
        signatures: SignatureMap;
        chainId: string | undefined;
        operationId: number | undefined;
        timelockId: number;
    }

    /*
     * Returns a CancelPair in Micheline format
     * @param cancel
     */
    export function CancelPairMicheline(cancel: CancelPair): string {
        return ``;
    }

    /*
     * Execute entrypoint parameters
     *
     * @param operationId The id of the operation to execute
     */
    export interface ExecutePair {
        operationId: number;
    }

    /*
     * Returns a ExecutePair in Micheline format
     * @param execute
     */
    export function ExecutePairMicheline(execute: ExecutePair): string {
        return ``;
    }

    /*
     * Return the bytes to sign for key rotation call
     * @param threshold The new threshold
     * @param keys The new list of keys
     * @param operationId The current operation id of the contract
     */
    export function keyRotationBytesToSubmit(threshold: number, keys: string[], operationId: number | undefined = undefined): string {
        // get chainid
        // get operationId if undefined
        // create michelson
        // encode
        return '';
    }

    /*
     * Returns the bytes to sign for operation cancellation call
     * @params timelockId The id of the operation to cancel
     * @params operationId The current operation id of the contract
     */
    export function cancelBytesToSubmit(timelockId: number, operationId: number | undefined = undefined): string {
        // get chainid
        // get operationId if undefined
        // create michelson
        // encode
        return '';
    }


    /*
     * Get a Timelock instance by querying a given address
     * @param server The Tezos node to communicate with
     * @param address The deployed Timelock contract address
     */
    export async function getStorage(server: string, address: string): Promise<Storage> {
        const storageResult = await TezosNodeReader.getContractStorage(server, address);
        console.log(storageResult);
        return {
            operationId: Number(JSONPath({ path: '$.args[0].args[0].int', json: storageResult })[0]),
            keys: JSONPath({ path: '$.args[0].args[1]', json: storageResult })[0].map(k => JSONPath({path: '$.string', json: k})),
            threshold: Number(JSONPath({ path: '$.args[1].int', json: storageResult })[0]),
            mapid: Number(JSONPath({ path: '$.args[2].int', json: storageResult })[0]),
            timelockSeconds: Number(JSONPath({ path: '$.args[3].int', json: storageResult })[0])
        }
    }
}

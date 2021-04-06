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
        const code: string = `parameter (or (or (pair %cancel (map key_hash signature) (pair chain_id (pair nat nat))) (nat %execute)) (or (pair %rotate (map key_hash signature) (pair chain_id (pair nat (pair nat (list key))))) (pair %submit (map key_hash signature) (pair chain_id (pair nat (lambda unit (list operation)))))));
storage   (pair (pair (nat %operationId) (list %signers key)) (pair (nat %threshold) (pair (big_map %timelock nat (pair timestamp (lambda unit (list operation)))) (nat %timelockSeconds))));
code
  {
    UNPAIR;     # @parameter : @storage
    IF_LEFT
      {
        IF_LEFT
          {
            # == cancel ==
            # match_pair_178_fst, match_pair_178_snd = sp.match_tuple(params, "match_pair_178_fst", "match_pair_178_snd") # @parameter%cancel : @storage
            DUP;        # @parameter%cancel : @parameter%cancel : @storage
            UNPAIR;     # map key_hash signature : pair chain_id (pair nat nat) : @parameter%cancel : @storage
            SWAP;       # pair chain_id (pair nat nat) : map key_hash signature : @parameter%cancel : @storage
            # match_pair_181_fst, match_pair_181_snd = sp.match_tuple(match_pair_178_snd, "match_pair_181_fst", "match_pair_181_snd") # pair chain_id (pair nat nat) : map key_hash signature : @parameter%cancel : @storage
            DUP;        # pair chain_id (pair nat nat) : pair chain_id (pair nat nat) : map key_hash signature : @parameter%cancel : @storage
            DUG 2;      # pair chain_id (pair nat nat) : map key_hash signature : pair chain_id (pair nat nat) : @parameter%cancel : @storage
            UNPAIR;     # chain_id : pair nat nat : map key_hash signature : pair chain_id (pair nat nat) : @parameter%cancel : @storage
            SWAP;       # pair nat nat : chain_id : map key_hash signature : pair chain_id (pair nat nat) : @parameter%cancel : @storage
            # match_pair_182_fst, match_pair_182_snd = sp.match_tuple(match_pair_181_snd, "match_pair_182_fst", "match_pair_182_snd") # pair nat nat : chain_id : map key_hash signature : pair chain_id (pair nat nat) : @parameter%cancel : @storage
            DUP;        # pair nat nat : pair nat nat : chain_id : map key_hash signature : pair chain_id (pair nat nat) : @parameter%cancel : @storage
            DUG 2;      # pair nat nat : chain_id : pair nat nat : map key_hash signature : pair chain_id (pair nat nat) : @parameter%cancel : @storage
            UNPAIR;     # nat : nat : chain_id : pair nat nat : map key_hash signature : pair chain_id (pair nat nat) : @parameter%cancel : @storage
            # sp.verify(sp.pack(sp.set_type_expr(match_pair_181_fst, sp.TChainId)) == sp.pack(sp.set_type_expr(sp.chain_id, sp.TChainId)), message = 'BAD_CHAIN_ID') # nat : nat : chain_id : pair nat nat : map key_hash signature : pair chain_id (pair nat nat) : @parameter%cancel : @storage
            CHAIN_ID;   # chain_id : nat : nat : chain_id : pair nat nat : map key_hash signature : pair chain_id (pair nat nat) : @parameter%cancel : @storage
            PACK;       # bytes : nat : nat : chain_id : pair nat nat : map key_hash signature : pair chain_id (pair nat nat) : @parameter%cancel : @storage
            DUP 4;      # chain_id : bytes : nat : nat : chain_id : pair nat nat : map key_hash signature : pair chain_id (pair nat nat) : @parameter%cancel : @storage
            PACK;       # bytes : bytes : nat : nat : chain_id : pair nat nat : map key_hash signature : pair chain_id (pair nat nat) : @parameter%cancel : @storage
            COMPARE;    # int : nat : nat : chain_id : pair nat nat : map key_hash signature : pair chain_id (pair nat nat) : @parameter%cancel : @storage
            EQ;         # bool : nat : nat : chain_id : pair nat nat : map key_hash signature : pair chain_id (pair nat nat) : @parameter%cancel : @storage
            IF
              {}
              {
                PUSH string "BAD_CHAIN_ID"; # string : nat : nat : chain_id : pair nat nat : map key_hash signature : pair chain_id (pair nat nat) : @parameter%cancel : @storage
                FAILWITH;   # FAILED
              }; # nat : nat : chain_id : pair nat nat : map key_hash signature : pair chain_id (pair nat nat) : @parameter%cancel : @storage
            # sp.verify(match_pair_182_fst == (self.data.operationId + 1), message = 'BAD_OP_ID') # nat : nat : chain_id : pair nat nat : map key_hash signature : pair chain_id (pair nat nat) : @parameter%cancel : @storage
            PUSH nat 1; # nat : nat : nat : chain_id : pair nat nat : map key_hash signature : pair chain_id (pair nat nat) : @parameter%cancel : @storage
            DUP 9;      # @storage : nat : nat : nat : chain_id : pair nat nat : map key_hash signature : pair chain_id (pair nat nat) : @parameter%cancel : @storage
            CAR;        # pair (nat %operationId) (list %signers key) : nat : nat : nat : chain_id : pair nat nat : map key_hash signature : pair chain_id (pair nat nat) : @parameter%cancel : @storage
            CAR;        # nat : nat : nat : nat : chain_id : pair nat nat : map key_hash signature : pair chain_id (pair nat nat) : @parameter%cancel : @storage
            ADD;        # nat : nat : nat : chain_id : pair nat nat : map key_hash signature : pair chain_id (pair nat nat) : @parameter%cancel : @storage
            SWAP;       # nat : nat : nat : chain_id : pair nat nat : map key_hash signature : pair chain_id (pair nat nat) : @parameter%cancel : @storage
            DUP;        # nat : nat : nat : nat : chain_id : pair nat nat : map key_hash signature : pair chain_id (pair nat nat) : @parameter%cancel : @storage
            DUG 2;      # nat : nat : nat : nat : chain_id : pair nat nat : map key_hash signature : pair chain_id (pair nat nat) : @parameter%cancel : @storage
            COMPARE;    # int : nat : nat : chain_id : pair nat nat : map key_hash signature : pair chain_id (pair nat nat) : @parameter%cancel : @storage
            EQ;         # bool : nat : nat : chain_id : pair nat nat : map key_hash signature : pair chain_id (pair nat nat) : @parameter%cancel : @storage
            IF
              {}
              {
                PUSH string "BAD_OP_ID"; # string : nat : nat : chain_id : pair nat nat : map key_hash signature : pair chain_id (pair nat nat) : @parameter%cancel : @storage
                FAILWITH;   # FAILED
              }; # nat : nat : chain_id : pair nat nat : map key_hash signature : pair chain_id (pair nat nat) : @parameter%cancel : @storage
            # valid_signatures_counter = sp.local("valid_signatures_counter", 0) # nat : nat : chain_id : pair nat nat : map key_hash signature : pair chain_id (pair nat nat) : @parameter%cancel : @storage
            PUSH nat 0; # nat : nat : nat : chain_id : pair nat nat : map key_hash signature : pair chain_id (pair nat nat) : @parameter%cancel : @storage
            # for signer in self.data.signers: ... # nat : nat : nat : chain_id : pair nat nat : map key_hash signature : pair chain_id (pair nat nat) : @parameter%cancel : @storage
            DUP 9;      # @storage : nat : nat : nat : chain_id : pair nat nat : map key_hash signature : pair chain_id (pair nat nat) : @parameter%cancel : @storage
            CAR;        # pair (nat %operationId) (list %signers key) : nat : nat : nat : chain_id : pair nat nat : map key_hash signature : pair chain_id (pair nat nat) : @parameter%cancel : @storage
            CDR;        # list key : nat : nat : nat : chain_id : pair nat nat : map key_hash signature : pair chain_id (pair nat nat) : @parameter%cancel : @storage
            ITER
              {
                # if match_pair_178_fst.contains(sp.hash_key(signer)): # key : nat : nat : nat : chain_id : pair nat nat : map key_hash signature : pair chain_id (pair nat nat) : @parameter%cancel : @storage
                DUP 7;      # map key_hash signature : key : nat : nat : nat : chain_id : pair nat nat : map key_hash signature : pair chain_id (pair nat nat) : @parameter%cancel : @storage
                SWAP;       # key : map key_hash signature : nat : nat : nat : chain_id : pair nat nat : map key_hash signature : pair chain_id (pair nat nat) : @parameter%cancel : @storage
                DUP;        # key : key : map key_hash signature : nat : nat : nat : chain_id : pair nat nat : map key_hash signature : pair chain_id (pair nat nat) : @parameter%cancel : @storage
                DUG 2;      # key : map key_hash signature : key : nat : nat : nat : chain_id : pair nat nat : map key_hash signature : pair chain_id (pair nat nat) : @parameter%cancel : @storage
                HASH_KEY;   # key_hash : map key_hash signature : key : nat : nat : nat : chain_id : pair nat nat : map key_hash signature : pair chain_id (pair nat nat) : @parameter%cancel : @storage
                MEM;        # bool : key : nat : nat : nat : chain_id : pair nat nat : map key_hash signature : pair chain_id (pair nat nat) : @parameter%cancel : @storage
                IF
                  {
                    # sp.verify(sp.check_signature(signer, match_pair_178_fst[sp.hash_key(signer)], sp.pack(match_pair_178_snd)), message = 'BAD_SIGNATURE') # key : nat : nat : nat : chain_id : pair nat nat : map key_hash signature : pair chain_id (pair nat nat) : @parameter%cancel : @storage
                    DUP 8;      # pair chain_id (pair nat nat) : key : nat : nat : nat : chain_id : pair nat nat : map key_hash signature : pair chain_id (pair nat nat) : @parameter%cancel : @storage
                    PACK;       # bytes : key : nat : nat : nat : chain_id : pair nat nat : map key_hash signature : pair chain_id (pair nat nat) : @parameter%cancel : @storage
                    DUP 8;      # map key_hash signature : bytes : key : nat : nat : nat : chain_id : pair nat nat : map key_hash signature : pair chain_id (pair nat nat) : @parameter%cancel : @storage
                    DUP 3;      # key : map key_hash signature : bytes : key : nat : nat : nat : chain_id : pair nat nat : map key_hash signature : pair chain_id (pair nat nat) : @parameter%cancel : @storage
                    HASH_KEY;   # key_hash : map key_hash signature : bytes : key : nat : nat : nat : chain_id : pair nat nat : map key_hash signature : pair chain_id (pair nat nat) : @parameter%cancel : @storage
                    GET;        # option signature : bytes : key : nat : nat : nat : chain_id : pair nat nat : map key_hash signature : pair chain_id (pair nat nat) : @parameter%cancel : @storage
                    IF_SOME
                      {
                        # of_some: Get-item:196 # @some : bytes : key : nat : nat : nat : chain_id : pair nat nat : map key_hash signature : pair chain_id (pair nat nat) : @parameter%cancel : @storage
                      }
                      {
                        PUSH int 196; # int : bytes : key : nat : nat : nat : chain_id : pair nat nat : map key_hash signature : pair chain_id (pair nat nat) : @parameter%cancel : @storage
                        FAILWITH;   # FAILED
                      }; # @some : bytes : key : nat : nat : nat : chain_id : pair nat nat : map key_hash signature : pair chain_id (pair nat nat) : @parameter%cancel : @storage
                    DIG 2;      # key : @some : bytes : nat : nat : nat : chain_id : pair nat nat : map key_hash signature : pair chain_id (pair nat nat) : @parameter%cancel : @storage
                    CHECK_SIGNATURE; # bool : nat : nat : nat : chain_id : pair nat nat : map key_hash signature : pair chain_id (pair nat nat) : @parameter%cancel : @storage
                    IF
                      {}
                      {
                        PUSH string "BAD_SIGNATURE"; # string : nat : nat : nat : chain_id : pair nat nat : map key_hash signature : pair chain_id (pair nat nat) : @parameter%cancel : @storage
                        FAILWITH;   # FAILED
                      }; # nat : nat : nat : chain_id : pair nat nat : map key_hash signature : pair chain_id (pair nat nat) : @parameter%cancel : @storage
                    # valid_signatures_counter.value += 1 # nat : nat : nat : chain_id : pair nat nat : map key_hash signature : pair chain_id (pair nat nat) : @parameter%cancel : @storage
                    PUSH nat 1; # nat : nat : nat : nat : chain_id : pair nat nat : map key_hash signature : pair chain_id (pair nat nat) : @parameter%cancel : @storage
                    ADD;        # nat : nat : nat : chain_id : pair nat nat : map key_hash signature : pair chain_id (pair nat nat) : @parameter%cancel : @storage
                  }
                  {
                    DROP;       # nat : nat : nat : chain_id : pair nat nat : map key_hash signature : pair chain_id (pair nat nat) : @parameter%cancel : @storage
                  }; # nat : nat : nat : chain_id : pair nat nat : map key_hash signature : pair chain_id (pair nat nat) : @parameter%cancel : @storage
              }; # nat : nat : nat : chain_id : pair nat nat : map key_hash signature : pair chain_id (pair nat nat) : @parameter%cancel : @storage
            SWAP;       # nat : nat : nat : chain_id : pair nat nat : map key_hash signature : pair chain_id (pair nat nat) : @parameter%cancel : @storage
            DROP;       # nat : nat : chain_id : pair nat nat : map key_hash signature : pair chain_id (pair nat nat) : @parameter%cancel : @storage
            DIG 2;      # chain_id : nat : nat : pair nat nat : map key_hash signature : pair chain_id (pair nat nat) : @parameter%cancel : @storage
            DROP;       # nat : nat : pair nat nat : map key_hash signature : pair chain_id (pair nat nat) : @parameter%cancel : @storage
            DIG 2;      # pair nat nat : nat : nat : map key_hash signature : pair chain_id (pair nat nat) : @parameter%cancel : @storage
            DROP;       # nat : nat : map key_hash signature : pair chain_id (pair nat nat) : @parameter%cancel : @storage
            DIG 2;      # map key_hash signature : nat : nat : pair chain_id (pair nat nat) : @parameter%cancel : @storage
            DROP;       # nat : nat : pair chain_id (pair nat nat) : @parameter%cancel : @storage
            DIG 2;      # pair chain_id (pair nat nat) : nat : nat : @parameter%cancel : @storage
            DROP;       # nat : nat : @parameter%cancel : @storage
            DIG 2;      # @parameter%cancel : nat : nat : @storage
            DROP;       # nat : nat : @storage
            # sp.verify(valid_signatures_counter.value >= self.data.threshold, message = 'TOO_FEW_SIGS') # nat : nat : @storage
            DUP 3;      # @storage : nat : nat : @storage
            GET 3;      # nat : nat : nat : @storage
            SWAP;       # nat : nat : nat : @storage
            COMPARE;    # int : nat : @storage
            GE;         # bool : nat : @storage
            IF
              {}
              {
                PUSH string "TOO_FEW_SIGS"; # string : nat : @storage
                FAILWITH;   # FAILED
              }; # nat : @storage
            SWAP;       # @storage : nat
            # self.data.operationId += 1 # @storage : nat
            UNPAIR;     # pair (nat %operationId) (list %signers key) : pair (nat %threshold) (pair (big_map %timelock nat (pair timestamp (lambda unit (list operation)))) (nat %timelockSeconds)) : nat
            UNPAIR;     # nat : list key : pair (nat %threshold) (pair (big_map %timelock nat (pair timestamp (lambda unit (list operation)))) (nat %timelockSeconds)) : nat
            PUSH nat 1; # nat : nat : list key : pair (nat %threshold) (pair (big_map %timelock nat (pair timestamp (lambda unit (list operation)))) (nat %timelockSeconds)) : nat
            ADD;        # nat : list key : pair (nat %threshold) (pair (big_map %timelock nat (pair timestamp (lambda unit (list operation)))) (nat %timelockSeconds)) : nat
            PAIR;       # pair nat (list key) : pair (nat %threshold) (pair (big_map %timelock nat (pair timestamp (lambda unit (list operation)))) (nat %timelockSeconds)) : nat
            SWAP;       # pair (nat %threshold) (pair (big_map %timelock nat (pair timestamp (lambda unit (list operation)))) (nat %timelockSeconds)) : pair nat (list key) : nat
            # del self.data.timelock[match_pair_182_snd] # pair (nat %threshold) (pair (big_map %timelock nat (pair timestamp (lambda unit (list operation)))) (nat %timelockSeconds)) : pair nat (list key) : nat
            UNPAIR;     # nat : pair (big_map %timelock nat (pair timestamp (lambda unit (list operation)))) (nat %timelockSeconds) : pair nat (list key) : nat
            SWAP;       # pair (big_map %timelock nat (pair timestamp (lambda unit (list operation)))) (nat %timelockSeconds) : nat : pair nat (list key) : nat
            UNPAIR;     # big_map nat (pair timestamp (lambda unit (list operation))) : nat : nat : pair nat (list key) : nat
            NONE (pair timestamp (lambda unit (list operation))); # option (pair timestamp (lambda unit (list operation))) : big_map nat (pair timestamp (lambda unit (list operation))) : nat : nat : pair nat (list key) : nat
            DIG 5;      # nat : option (pair timestamp (lambda unit (list operation))) : big_map nat (pair timestamp (lambda unit (list operation))) : nat : nat : pair nat (list key)
            UPDATE;     # big_map nat (pair timestamp (lambda unit (list operation))) : nat : nat : pair nat (list key)
            PAIR;       # pair (big_map nat (pair timestamp (lambda unit (list operation)))) nat : nat : pair nat (list key)
            SWAP;       # nat : pair (big_map nat (pair timestamp (lambda unit (list operation)))) nat : pair nat (list key)
            PAIR;       # pair nat (pair (big_map nat (pair timestamp (lambda unit (list operation)))) nat) : pair nat (list key)
            SWAP;       # pair nat (list key) : pair nat (pair (big_map nat (pair timestamp (lambda unit (list operation)))) nat)
            PAIR;       # pair (pair nat (list key)) (pair nat (pair (big_map nat (pair timestamp (lambda unit (list operation)))) nat))
            NIL operation; # list operation : pair (pair nat (list key)) (pair nat (pair (big_map nat (pair timestamp (lambda unit (list operation)))) nat))
          }
          {
            SWAP;       # @storage : @parameter%execute
            # == execute ==
            # match_pair_215_fst, match_pair_215_snd = sp.match_tuple(self.data.timelock[params], "match_pair_215_fst", "match_pair_215_snd") # @storage : @parameter%execute
            DUP;        # @storage : @storage : @parameter%execute
            DUG 2;      # @storage : @parameter%execute : @storage
            GET 5;      # big_map nat (pair timestamp (lambda unit (list operation))) : @parameter%execute : @storage
            SWAP;       # @parameter%execute : big_map nat (pair timestamp (lambda unit (list operation))) : @storage
            DUP;        # @parameter%execute : @parameter%execute : big_map nat (pair timestamp (lambda unit (list operation))) : @storage
            DUG 2;      # @parameter%execute : big_map nat (pair timestamp (lambda unit (list operation))) : @parameter%execute : @storage
            GET;        # option (pair timestamp (lambda unit (list operation))) : @parameter%execute : @storage
            IF_SOME
              {
                # of_some: Get-item:214 # @some : @parameter%execute : @storage
              }
              {
                PUSH int 214; # int : @parameter%execute : @storage
                FAILWITH;   # FAILED
              }; # @some : @parameter%execute : @storage
            UNPAIR;     # timestamp : lambda unit (list operation) : @parameter%execute : @storage
            # sp.verify(sp.add_seconds(match_pair_215_fst, sp.to_int(self.data.timelockSeconds)) < sp.now, message = 'TOO_EARLY') # timestamp : lambda unit (list operation) : @parameter%execute : @storage
            NOW;        # timestamp : timestamp : lambda unit (list operation) : @parameter%execute : @storage
            SWAP;       # timestamp : timestamp : lambda unit (list operation) : @parameter%execute : @storage
            DUP 5;      # @storage : timestamp : timestamp : lambda unit (list operation) : @parameter%execute : @storage
            GET 6;      # nat : timestamp : timestamp : lambda unit (list operation) : @parameter%execute : @storage
            INT;        # int : timestamp : timestamp : lambda unit (list operation) : @parameter%execute : @storage
            ADD;        # timestamp : timestamp : lambda unit (list operation) : @parameter%execute : @storage
            COMPARE;    # int : lambda unit (list operation) : @parameter%execute : @storage
            LT;         # bool : lambda unit (list operation) : @parameter%execute : @storage
            IF
              {}
              {
                PUSH string "TOO_EARLY"; # string : lambda unit (list operation) : @parameter%execute : @storage
                FAILWITH;   # FAILED
              }; # lambda unit (list operation) : @parameter%execute : @storage
            # del self.data.timelock[params] # lambda unit (list operation) : @parameter%execute : @storage
            DIG 2;      # @storage : lambda unit (list operation) : @parameter%execute
            UNPAIR;     # pair (nat %operationId) (list %signers key) : pair (nat %threshold) (pair (big_map %timelock nat (pair timestamp (lambda unit (list operation)))) (nat %timelockSeconds)) : lambda unit (list operation) : @parameter%execute
            SWAP;       # pair (nat %threshold) (pair (big_map %timelock nat (pair timestamp (lambda unit (list operation)))) (nat %timelockSeconds)) : pair (nat %operationId) (list %signers key) : lambda unit (list operation) : @parameter%execute
            UNPAIR;     # nat : pair (big_map %timelock nat (pair timestamp (lambda unit (list operation)))) (nat %timelockSeconds) : pair (nat %operationId) (list %signers key) : lambda unit (list operation) : @parameter%execute
            SWAP;       # pair (big_map %timelock nat (pair timestamp (lambda unit (list operation)))) (nat %timelockSeconds) : nat : pair (nat %operationId) (list %signers key) : lambda unit (list operation) : @parameter%execute
            UNPAIR;     # big_map nat (pair timestamp (lambda unit (list operation))) : nat : nat : pair (nat %operationId) (list %signers key) : lambda unit (list operation) : @parameter%execute
            NONE (pair timestamp (lambda unit (list operation))); # option (pair timestamp (lambda unit (list operation))) : big_map nat (pair timestamp (lambda unit (list operation))) : nat : nat : pair (nat %operationId) (list %signers key) : lambda unit (list operation) : @parameter%execute
            DIG 6;      # @parameter%execute : option (pair timestamp (lambda unit (list operation))) : big_map nat (pair timestamp (lambda unit (list operation))) : nat : nat : pair (nat %operationId) (list %signers key) : lambda unit (list operation)
            UPDATE;     # big_map nat (pair timestamp (lambda unit (list operation))) : nat : nat : pair (nat %operationId) (list %signers key) : lambda unit (list operation)
            PAIR;       # pair (big_map nat (pair timestamp (lambda unit (list operation)))) nat : nat : pair (nat %operationId) (list %signers key) : lambda unit (list operation)
            SWAP;       # nat : pair (big_map nat (pair timestamp (lambda unit (list operation)))) nat : pair (nat %operationId) (list %signers key) : lambda unit (list operation)
            PAIR;       # pair nat (pair (big_map nat (pair timestamp (lambda unit (list operation)))) nat) : pair (nat %operationId) (list %signers key) : lambda unit (list operation)
            SWAP;       # pair (nat %operationId) (list %signers key) : pair nat (pair (big_map nat (pair timestamp (lambda unit (list operation)))) nat) : lambda unit (list operation)
            PAIR;       # pair (pair (nat %operationId) (list %signers key)) (pair nat (pair (big_map nat (pair timestamp (lambda unit (list operation)))) nat)) : lambda unit (list operation)
            SWAP;       # lambda unit (list operation) : pair (pair (nat %operationId) (list %signers key)) (pair nat (pair (big_map nat (pair timestamp (lambda unit (list operation)))) nat))
            # for op in match_pair_215_snd(sp.unit): ... # lambda unit (list operation) : pair (pair (nat %operationId) (list %signers key)) (pair nat (pair (big_map nat (pair timestamp (lambda unit (list operation)))) nat))
            NIL operation; # list operation : lambda unit (list operation) : pair (pair (nat %operationId) (list %signers key)) (pair nat (pair (big_map nat (pair timestamp (lambda unit (list operation)))) nat))
            SWAP;       # lambda unit (list operation) : list operation : pair (pair (nat %operationId) (list %signers key)) (pair nat (pair (big_map nat (pair timestamp (lambda unit (list operation)))) nat))
            UNIT;       # unit : lambda unit (list operation) : list operation : pair (pair (nat %operationId) (list %signers key)) (pair nat (pair (big_map nat (pair timestamp (lambda unit (list operation)))) nat))
            EXEC;       # list operation : list operation : pair (pair (nat %operationId) (list %signers key)) (pair nat (pair (big_map nat (pair timestamp (lambda unit (list operation)))) nat))
            ITER
              {
                # sp.operations().push(op) # operation : list operation : pair (pair (nat %operationId) (list %signers key)) (pair nat (pair (big_map nat (pair timestamp (lambda unit (list operation)))) nat))
                CONS;       # list operation : pair (pair (nat %operationId) (list %signers key)) (pair nat (pair (big_map nat (pair timestamp (lambda unit (list operation)))) nat))
              }; # list operation : pair (pair (nat %operationId) (list %signers key)) (pair nat (pair (big_map nat (pair timestamp (lambda unit (list operation)))) nat))
          }; # list operation : pair (pair nat (list key)) (pair nat (pair (big_map nat (pair timestamp (lambda unit (list operation)))) nat))
      }
      {
        IF_LEFT
          {
            # == rotate ==
            # match_pair_139_fst, match_pair_139_snd = sp.match_tuple(params, "match_pair_139_fst", "match_pair_139_snd") # @parameter%rotate : @storage
            DUP;        # @parameter%rotate : @parameter%rotate : @storage
            UNPAIR;     # map key_hash signature : pair chain_id (pair nat (pair nat (list key))) : @parameter%rotate : @storage
            SWAP;       # pair chain_id (pair nat (pair nat (list key))) : map key_hash signature : @parameter%rotate : @storage
            # match_pair_142_fst, match_pair_142_snd = sp.match_tuple(match_pair_139_snd, "match_pair_142_fst", "match_pair_142_snd") # pair chain_id (pair nat (pair nat (list key))) : map key_hash signature : @parameter%rotate : @storage
            DUP;        # pair chain_id (pair nat (pair nat (list key))) : pair chain_id (pair nat (pair nat (list key))) : map key_hash signature : @parameter%rotate : @storage
            DUG 2;      # pair chain_id (pair nat (pair nat (list key))) : map key_hash signature : pair chain_id (pair nat (pair nat (list key))) : @parameter%rotate : @storage
            UNPAIR;     # chain_id : pair nat (pair nat (list key)) : map key_hash signature : pair chain_id (pair nat (pair nat (list key))) : @parameter%rotate : @storage
            SWAP;       # pair nat (pair nat (list key)) : chain_id : map key_hash signature : pair chain_id (pair nat (pair nat (list key))) : @parameter%rotate : @storage
            # match_pair_143_fst, match_pair_143_snd = sp.match_tuple(match_pair_142_snd, "match_pair_143_fst", "match_pair_143_snd") # pair nat (pair nat (list key)) : chain_id : map key_hash signature : pair chain_id (pair nat (pair nat (list key))) : @parameter%rotate : @storage
            DUP;        # pair nat (pair nat (list key)) : pair nat (pair nat (list key)) : chain_id : map key_hash signature : pair chain_id (pair nat (pair nat (list key))) : @parameter%rotate : @storage
            DUG 2;      # pair nat (pair nat (list key)) : chain_id : pair nat (pair nat (list key)) : map key_hash signature : pair chain_id (pair nat (pair nat (list key))) : @parameter%rotate : @storage
            UNPAIR;     # nat : pair nat (list key) : chain_id : pair nat (pair nat (list key)) : map key_hash signature : pair chain_id (pair nat (pair nat (list key))) : @parameter%rotate : @storage
            # sp.verify(sp.pack(sp.set_type_expr(match_pair_142_fst, sp.TChainId)) == sp.pack(sp.set_type_expr(sp.chain_id, sp.TChainId)), message = 'BAD_CHAIN_ID') # nat : pair nat (list key) : chain_id : pair nat (pair nat (list key)) : map key_hash signature : pair chain_id (pair nat (pair nat (list key))) : @parameter%rotate : @storage
            CHAIN_ID;   # chain_id : nat : pair nat (list key) : chain_id : pair nat (pair nat (list key)) : map key_hash signature : pair chain_id (pair nat (pair nat (list key))) : @parameter%rotate : @storage
            PACK;       # bytes : nat : pair nat (list key) : chain_id : pair nat (pair nat (list key)) : map key_hash signature : pair chain_id (pair nat (pair nat (list key))) : @parameter%rotate : @storage
            DUP 4;      # chain_id : bytes : nat : pair nat (list key) : chain_id : pair nat (pair nat (list key)) : map key_hash signature : pair chain_id (pair nat (pair nat (list key))) : @parameter%rotate : @storage
            PACK;       # bytes : bytes : nat : pair nat (list key) : chain_id : pair nat (pair nat (list key)) : map key_hash signature : pair chain_id (pair nat (pair nat (list key))) : @parameter%rotate : @storage
            COMPARE;    # int : nat : pair nat (list key) : chain_id : pair nat (pair nat (list key)) : map key_hash signature : pair chain_id (pair nat (pair nat (list key))) : @parameter%rotate : @storage
            EQ;         # bool : nat : pair nat (list key) : chain_id : pair nat (pair nat (list key)) : map key_hash signature : pair chain_id (pair nat (pair nat (list key))) : @parameter%rotate : @storage
            IF
              {}
              {
                PUSH string "BAD_CHAIN_ID"; # string : nat : pair nat (list key) : chain_id : pair nat (pair nat (list key)) : map key_hash signature : pair chain_id (pair nat (pair nat (list key))) : @parameter%rotate : @storage
                FAILWITH;   # FAILED
              }; # nat : pair nat (list key) : chain_id : pair nat (pair nat (list key)) : map key_hash signature : pair chain_id (pair nat (pair nat (list key))) : @parameter%rotate : @storage
            # sp.verify(match_pair_143_fst == (self.data.operationId + 1), message = 'BAD_OP_ID') # nat : pair nat (list key) : chain_id : pair nat (pair nat (list key)) : map key_hash signature : pair chain_id (pair nat (pair nat (list key))) : @parameter%rotate : @storage
            PUSH nat 1; # nat : nat : pair nat (list key) : chain_id : pair nat (pair nat (list key)) : map key_hash signature : pair chain_id (pair nat (pair nat (list key))) : @parameter%rotate : @storage
            DUP 9;      # @storage : nat : nat : pair nat (list key) : chain_id : pair nat (pair nat (list key)) : map key_hash signature : pair chain_id (pair nat (pair nat (list key))) : @parameter%rotate : @storage
            CAR;        # pair (nat %operationId) (list %signers key) : nat : nat : pair nat (list key) : chain_id : pair nat (pair nat (list key)) : map key_hash signature : pair chain_id (pair nat (pair nat (list key))) : @parameter%rotate : @storage
            CAR;        # nat : nat : nat : pair nat (list key) : chain_id : pair nat (pair nat (list key)) : map key_hash signature : pair chain_id (pair nat (pair nat (list key))) : @parameter%rotate : @storage
            ADD;        # nat : nat : pair nat (list key) : chain_id : pair nat (pair nat (list key)) : map key_hash signature : pair chain_id (pair nat (pair nat (list key))) : @parameter%rotate : @storage
            SWAP;       # nat : nat : pair nat (list key) : chain_id : pair nat (pair nat (list key)) : map key_hash signature : pair chain_id (pair nat (pair nat (list key))) : @parameter%rotate : @storage
            DUP;        # nat : nat : nat : pair nat (list key) : chain_id : pair nat (pair nat (list key)) : map key_hash signature : pair chain_id (pair nat (pair nat (list key))) : @parameter%rotate : @storage
            DUG 2;      # nat : nat : nat : pair nat (list key) : chain_id : pair nat (pair nat (list key)) : map key_hash signature : pair chain_id (pair nat (pair nat (list key))) : @parameter%rotate : @storage
            COMPARE;    # int : nat : pair nat (list key) : chain_id : pair nat (pair nat (list key)) : map key_hash signature : pair chain_id (pair nat (pair nat (list key))) : @parameter%rotate : @storage
            EQ;         # bool : nat : pair nat (list key) : chain_id : pair nat (pair nat (list key)) : map key_hash signature : pair chain_id (pair nat (pair nat (list key))) : @parameter%rotate : @storage
            IF
              {}
              {
                PUSH string "BAD_OP_ID"; # string : nat : pair nat (list key) : chain_id : pair nat (pair nat (list key)) : map key_hash signature : pair chain_id (pair nat (pair nat (list key))) : @parameter%rotate : @storage
                FAILWITH;   # FAILED
              }; # nat : pair nat (list key) : chain_id : pair nat (pair nat (list key)) : map key_hash signature : pair chain_id (pair nat (pair nat (list key))) : @parameter%rotate : @storage
            # valid_signatures_counter = sp.local("valid_signatures_counter", 0) # nat : pair nat (list key) : chain_id : pair nat (pair nat (list key)) : map key_hash signature : pair chain_id (pair nat (pair nat (list key))) : @parameter%rotate : @storage
            PUSH nat 0; # nat : nat : pair nat (list key) : chain_id : pair nat (pair nat (list key)) : map key_hash signature : pair chain_id (pair nat (pair nat (list key))) : @parameter%rotate : @storage
            # for signer in self.data.signers: ... # nat : nat : pair nat (list key) : chain_id : pair nat (pair nat (list key)) : map key_hash signature : pair chain_id (pair nat (pair nat (list key))) : @parameter%rotate : @storage
            DUP 9;      # @storage : nat : nat : pair nat (list key) : chain_id : pair nat (pair nat (list key)) : map key_hash signature : pair chain_id (pair nat (pair nat (list key))) : @parameter%rotate : @storage
            CAR;        # pair (nat %operationId) (list %signers key) : nat : nat : pair nat (list key) : chain_id : pair nat (pair nat (list key)) : map key_hash signature : pair chain_id (pair nat (pair nat (list key))) : @parameter%rotate : @storage
            CDR;        # list key : nat : nat : pair nat (list key) : chain_id : pair nat (pair nat (list key)) : map key_hash signature : pair chain_id (pair nat (pair nat (list key))) : @parameter%rotate : @storage
            ITER
              {
                # if match_pair_139_fst.contains(sp.hash_key(signer)): # key : nat : nat : pair nat (list key) : chain_id : pair nat (pair nat (list key)) : map key_hash signature : pair chain_id (pair nat (pair nat (list key))) : @parameter%rotate : @storage
                DUP 7;      # map key_hash signature : key : nat : nat : pair nat (list key) : chain_id : pair nat (pair nat (list key)) : map key_hash signature : pair chain_id (pair nat (pair nat (list key))) : @parameter%rotate : @storage
                SWAP;       # key : map key_hash signature : nat : nat : pair nat (list key) : chain_id : pair nat (pair nat (list key)) : map key_hash signature : pair chain_id (pair nat (pair nat (list key))) : @parameter%rotate : @storage
                DUP;        # key : key : map key_hash signature : nat : nat : pair nat (list key) : chain_id : pair nat (pair nat (list key)) : map key_hash signature : pair chain_id (pair nat (pair nat (list key))) : @parameter%rotate : @storage
                DUG 2;      # key : map key_hash signature : key : nat : nat : pair nat (list key) : chain_id : pair nat (pair nat (list key)) : map key_hash signature : pair chain_id (pair nat (pair nat (list key))) : @parameter%rotate : @storage
                HASH_KEY;   # key_hash : map key_hash signature : key : nat : nat : pair nat (list key) : chain_id : pair nat (pair nat (list key)) : map key_hash signature : pair chain_id (pair nat (pair nat (list key))) : @parameter%rotate : @storage
                MEM;        # bool : key : nat : nat : pair nat (list key) : chain_id : pair nat (pair nat (list key)) : map key_hash signature : pair chain_id (pair nat (pair nat (list key))) : @parameter%rotate : @storage
                IF
                  {
                    # sp.verify(sp.check_signature(signer, match_pair_139_fst[sp.hash_key(signer)], sp.pack(match_pair_139_snd)), message = 'BAD_SIGNATURE') # key : nat : nat : pair nat (list key) : chain_id : pair nat (pair nat (list key)) : map key_hash signature : pair chain_id (pair nat (pair nat (list key))) : @parameter%rotate : @storage
                    DUP 8;      # pair chain_id (pair nat (pair nat (list key))) : key : nat : nat : pair nat (list key) : chain_id : pair nat (pair nat (list key)) : map key_hash signature : pair chain_id (pair nat (pair nat (list key))) : @parameter%rotate : @storage
                    PACK;       # bytes : key : nat : nat : pair nat (list key) : chain_id : pair nat (pair nat (list key)) : map key_hash signature : pair chain_id (pair nat (pair nat (list key))) : @parameter%rotate : @storage
                    DUP 8;      # map key_hash signature : bytes : key : nat : nat : pair nat (list key) : chain_id : pair nat (pair nat (list key)) : map key_hash signature : pair chain_id (pair nat (pair nat (list key))) : @parameter%rotate : @storage
                    DUP 3;      # key : map key_hash signature : bytes : key : nat : nat : pair nat (list key) : chain_id : pair nat (pair nat (list key)) : map key_hash signature : pair chain_id (pair nat (pair nat (list key))) : @parameter%rotate : @storage
                    HASH_KEY;   # key_hash : map key_hash signature : bytes : key : nat : nat : pair nat (list key) : chain_id : pair nat (pair nat (list key)) : map key_hash signature : pair chain_id (pair nat (pair nat (list key))) : @parameter%rotate : @storage
                    GET;        # option signature : bytes : key : nat : nat : pair nat (list key) : chain_id : pair nat (pair nat (list key)) : map key_hash signature : pair chain_id (pair nat (pair nat (list key))) : @parameter%rotate : @storage
                    IF_SOME
                      {
                        # of_some: Get-item:157 # @some : bytes : key : nat : nat : pair nat (list key) : chain_id : pair nat (pair nat (list key)) : map key_hash signature : pair chain_id (pair nat (pair nat (list key))) : @parameter%rotate : @storage
                      }
                      {
                        PUSH int 157; # int : bytes : key : nat : nat : pair nat (list key) : chain_id : pair nat (pair nat (list key)) : map key_hash signature : pair chain_id (pair nat (pair nat (list key))) : @parameter%rotate : @storage
                        FAILWITH;   # FAILED
                      }; # @some : bytes : key : nat : nat : pair nat (list key) : chain_id : pair nat (pair nat (list key)) : map key_hash signature : pair chain_id (pair nat (pair nat (list key))) : @parameter%rotate : @storage
                    DIG 2;      # key : @some : bytes : nat : nat : pair nat (list key) : chain_id : pair nat (pair nat (list key)) : map key_hash signature : pair chain_id (pair nat (pair nat (list key))) : @parameter%rotate : @storage
                    CHECK_SIGNATURE; # bool : nat : nat : pair nat (list key) : chain_id : pair nat (pair nat (list key)) : map key_hash signature : pair chain_id (pair nat (pair nat (list key))) : @parameter%rotate : @storage
                    IF
                      {}
                      {
                        PUSH string "BAD_SIGNATURE"; # string : nat : nat : pair nat (list key) : chain_id : pair nat (pair nat (list key)) : map key_hash signature : pair chain_id (pair nat (pair nat (list key))) : @parameter%rotate : @storage
                        FAILWITH;   # FAILED
                      }; # nat : nat : pair nat (list key) : chain_id : pair nat (pair nat (list key)) : map key_hash signature : pair chain_id (pair nat (pair nat (list key))) : @parameter%rotate : @storage
                    # valid_signatures_counter.value += 1 # nat : nat : pair nat (list key) : chain_id : pair nat (pair nat (list key)) : map key_hash signature : pair chain_id (pair nat (pair nat (list key))) : @parameter%rotate : @storage
                    PUSH nat 1; # nat : nat : nat : pair nat (list key) : chain_id : pair nat (pair nat (list key)) : map key_hash signature : pair chain_id (pair nat (pair nat (list key))) : @parameter%rotate : @storage
                    ADD;        # nat : nat : pair nat (list key) : chain_id : pair nat (pair nat (list key)) : map key_hash signature : pair chain_id (pair nat (pair nat (list key))) : @parameter%rotate : @storage
                  }
                  {
                    DROP;       # nat : nat : pair nat (list key) : chain_id : pair nat (pair nat (list key)) : map key_hash signature : pair chain_id (pair nat (pair nat (list key))) : @parameter%rotate : @storage
                  }; # nat : nat : pair nat (list key) : chain_id : pair nat (pair nat (list key)) : map key_hash signature : pair chain_id (pair nat (pair nat (list key))) : @parameter%rotate : @storage
              }; # nat : nat : pair nat (list key) : chain_id : pair nat (pair nat (list key)) : map key_hash signature : pair chain_id (pair nat (pair nat (list key))) : @parameter%rotate : @storage
            SWAP;       # nat : nat : pair nat (list key) : chain_id : pair nat (pair nat (list key)) : map key_hash signature : pair chain_id (pair nat (pair nat (list key))) : @parameter%rotate : @storage
            DROP;       # nat : pair nat (list key) : chain_id : pair nat (pair nat (list key)) : map key_hash signature : pair chain_id (pair nat (pair nat (list key))) : @parameter%rotate : @storage
            DIG 2;      # chain_id : nat : pair nat (list key) : pair nat (pair nat (list key)) : map key_hash signature : pair chain_id (pair nat (pair nat (list key))) : @parameter%rotate : @storage
            DROP;       # nat : pair nat (list key) : pair nat (pair nat (list key)) : map key_hash signature : pair chain_id (pair nat (pair nat (list key))) : @parameter%rotate : @storage
            DIG 2;      # pair nat (pair nat (list key)) : nat : pair nat (list key) : map key_hash signature : pair chain_id (pair nat (pair nat (list key))) : @parameter%rotate : @storage
            DROP;       # nat : pair nat (list key) : map key_hash signature : pair chain_id (pair nat (pair nat (list key))) : @parameter%rotate : @storage
            DIG 2;      # map key_hash signature : nat : pair nat (list key) : pair chain_id (pair nat (pair nat (list key))) : @parameter%rotate : @storage
            DROP;       # nat : pair nat (list key) : pair chain_id (pair nat (pair nat (list key))) : @parameter%rotate : @storage
            DIG 2;      # pair chain_id (pair nat (pair nat (list key))) : nat : pair nat (list key) : @parameter%rotate : @storage
            DROP;       # nat : pair nat (list key) : @parameter%rotate : @storage
            DIG 2;      # @parameter%rotate : nat : pair nat (list key) : @storage
            DROP;       # nat : pair nat (list key) : @storage
            # sp.verify(valid_signatures_counter.value >= self.data.threshold, message = 'TOO_FEW_SIGS') # nat : pair nat (list key) : @storage
            DUP 3;      # @storage : nat : pair nat (list key) : @storage
            GET 3;      # nat : nat : pair nat (list key) : @storage
            SWAP;       # nat : nat : pair nat (list key) : @storage
            COMPARE;    # int : pair nat (list key) : @storage
            GE;         # bool : pair nat (list key) : @storage
            IF
              {}
              {
                PUSH string "TOO_FEW_SIGS"; # string : pair nat (list key) : @storage
                FAILWITH;   # FAILED
              }; # pair nat (list key) : @storage
            SWAP;       # @storage : pair nat (list key)
            # self.data.operationId += 1 # @storage : pair nat (list key)
            UNPAIR;     # pair (nat %operationId) (list %signers key) : pair (nat %threshold) (pair (big_map %timelock nat (pair timestamp (lambda unit (list operation)))) (nat %timelockSeconds)) : pair nat (list key)
            UNPAIR;     # nat : list key : pair (nat %threshold) (pair (big_map %timelock nat (pair timestamp (lambda unit (list operation)))) (nat %timelockSeconds)) : pair nat (list key)
            PUSH nat 1; # nat : nat : list key : pair (nat %threshold) (pair (big_map %timelock nat (pair timestamp (lambda unit (list operation)))) (nat %timelockSeconds)) : pair nat (list key)
            ADD;        # nat : list key : pair (nat %threshold) (pair (big_map %timelock nat (pair timestamp (lambda unit (list operation)))) (nat %timelockSeconds)) : pair nat (list key)
            PAIR;       # pair nat (list key) : pair (nat %threshold) (pair (big_map %timelock nat (pair timestamp (lambda unit (list operation)))) (nat %timelockSeconds)) : pair nat (list key)
            PAIR;       # pair (pair nat (list key)) (pair (nat %threshold) (pair (big_map %timelock nat (pair timestamp (lambda unit (list operation)))) (nat %timelockSeconds))) : pair nat (list key)
            SWAP;       # pair nat (list key) : pair (pair nat (list key)) (pair (nat %threshold) (pair (big_map %timelock nat (pair timestamp (lambda unit (list operation)))) (nat %timelockSeconds)))
            # match_pair_167_fst, match_pair_167_snd = sp.match_tuple(match_pair_143_snd, "match_pair_167_fst", "match_pair_167_snd") # pair nat (list key) : pair (pair nat (list key)) (pair (nat %threshold) (pair (big_map %timelock nat (pair timestamp (lambda unit (list operation)))) (nat %timelockSeconds)))
            UNPAIR;     # nat : list key : pair (pair nat (list key)) (pair (nat %threshold) (pair (big_map %timelock nat (pair timestamp (lambda unit (list operation)))) (nat %timelockSeconds)))
            # self.data.threshold = match_pair_167_fst # nat : list key : pair (pair nat (list key)) (pair (nat %threshold) (pair (big_map %timelock nat (pair timestamp (lambda unit (list operation)))) (nat %timelockSeconds)))
            DIG 2;      # pair (pair nat (list key)) (pair (nat %threshold) (pair (big_map %timelock nat (pair timestamp (lambda unit (list operation)))) (nat %timelockSeconds))) : nat : list key
            UNPAIR;     # pair nat (list key) : pair (nat %threshold) (pair (big_map %timelock nat (pair timestamp (lambda unit (list operation)))) (nat %timelockSeconds)) : nat : list key
            SWAP;       # pair (nat %threshold) (pair (big_map %timelock nat (pair timestamp (lambda unit (list operation)))) (nat %timelockSeconds)) : pair nat (list key) : nat : list key
            CDR;        # pair (big_map %timelock nat (pair timestamp (lambda unit (list operation)))) (nat %timelockSeconds) : pair nat (list key) : nat : list key
            DIG 2;      # nat : pair (big_map %timelock nat (pair timestamp (lambda unit (list operation)))) (nat %timelockSeconds) : pair nat (list key) : list key
            PAIR;       # pair nat (pair (big_map %timelock nat (pair timestamp (lambda unit (list operation)))) (nat %timelockSeconds)) : pair nat (list key) : list key
            SWAP;       # pair nat (list key) : pair nat (pair (big_map %timelock nat (pair timestamp (lambda unit (list operation)))) (nat %timelockSeconds)) : list key
            # self.data.signers = match_pair_167_snd # pair nat (list key) : pair nat (pair (big_map %timelock nat (pair timestamp (lambda unit (list operation)))) (nat %timelockSeconds)) : list key
            CAR;        # nat : pair nat (pair (big_map %timelock nat (pair timestamp (lambda unit (list operation)))) (nat %timelockSeconds)) : list key
            DIG 2;      # list key : nat : pair nat (pair (big_map %timelock nat (pair timestamp (lambda unit (list operation)))) (nat %timelockSeconds))
            SWAP;       # nat : list key : pair nat (pair (big_map %timelock nat (pair timestamp (lambda unit (list operation)))) (nat %timelockSeconds))
            PAIR;       # pair nat (list key) : pair nat (pair (big_map %timelock nat (pair timestamp (lambda unit (list operation)))) (nat %timelockSeconds))
            PAIR;       # pair (pair nat (list key)) (pair nat (pair (big_map %timelock nat (pair timestamp (lambda unit (list operation)))) (nat %timelockSeconds)))
          }
          {
            # == submit ==
            # match_pair_102_fst, match_pair_102_snd = sp.match_tuple(params, "match_pair_102_fst", "match_pair_102_snd") # @parameter%submit : @storage
            DUP;        # @parameter%submit : @parameter%submit : @storage
            UNPAIR;     # map key_hash signature : pair chain_id (pair nat (lambda unit (list operation))) : @parameter%submit : @storage
            SWAP;       # pair chain_id (pair nat (lambda unit (list operation))) : map key_hash signature : @parameter%submit : @storage
            # match_pair_105_fst, match_pair_105_snd = sp.match_tuple(match_pair_102_snd, "match_pair_105_fst", "match_pair_105_snd") # pair chain_id (pair nat (lambda unit (list operation))) : map key_hash signature : @parameter%submit : @storage
            DUP;        # pair chain_id (pair nat (lambda unit (list operation))) : pair chain_id (pair nat (lambda unit (list operation))) : map key_hash signature : @parameter%submit : @storage
            DUG 2;      # pair chain_id (pair nat (lambda unit (list operation))) : map key_hash signature : pair chain_id (pair nat (lambda unit (list operation))) : @parameter%submit : @storage
            UNPAIR;     # chain_id : pair nat (lambda unit (list operation)) : map key_hash signature : pair chain_id (pair nat (lambda unit (list operation))) : @parameter%submit : @storage
            SWAP;       # pair nat (lambda unit (list operation)) : chain_id : map key_hash signature : pair chain_id (pair nat (lambda unit (list operation))) : @parameter%submit : @storage
            # match_pair_106_fst, match_pair_106_snd = sp.match_tuple(match_pair_105_snd, "match_pair_106_fst", "match_pair_106_snd") # pair nat (lambda unit (list operation)) : chain_id : map key_hash signature : pair chain_id (pair nat (lambda unit (list operation))) : @parameter%submit : @storage
            DUP;        # pair nat (lambda unit (list operation)) : pair nat (lambda unit (list operation)) : chain_id : map key_hash signature : pair chain_id (pair nat (lambda unit (list operation))) : @parameter%submit : @storage
            DUG 2;      # pair nat (lambda unit (list operation)) : chain_id : pair nat (lambda unit (list operation)) : map key_hash signature : pair chain_id (pair nat (lambda unit (list operation))) : @parameter%submit : @storage
            UNPAIR;     # nat : lambda unit (list operation) : chain_id : pair nat (lambda unit (list operation)) : map key_hash signature : pair chain_id (pair nat (lambda unit (list operation))) : @parameter%submit : @storage
            # sp.verify(sp.pack(sp.set_type_expr(match_pair_105_fst, sp.TChainId)) == sp.pack(sp.set_type_expr(sp.chain_id, sp.TChainId)), message = 'BAD_CHAIN_ID') # nat : lambda unit (list operation) : chain_id : pair nat (lambda unit (list operation)) : map key_hash signature : pair chain_id (pair nat (lambda unit (list operation))) : @parameter%submit : @storage
            CHAIN_ID;   # chain_id : nat : lambda unit (list operation) : chain_id : pair nat (lambda unit (list operation)) : map key_hash signature : pair chain_id (pair nat (lambda unit (list operation))) : @parameter%submit : @storage
            PACK;       # bytes : nat : lambda unit (list operation) : chain_id : pair nat (lambda unit (list operation)) : map key_hash signature : pair chain_id (pair nat (lambda unit (list operation))) : @parameter%submit : @storage
            DUP 4;      # chain_id : bytes : nat : lambda unit (list operation) : chain_id : pair nat (lambda unit (list operation)) : map key_hash signature : pair chain_id (pair nat (lambda unit (list operation))) : @parameter%submit : @storage
            PACK;       # bytes : bytes : nat : lambda unit (list operation) : chain_id : pair nat (lambda unit (list operation)) : map key_hash signature : pair chain_id (pair nat (lambda unit (list operation))) : @parameter%submit : @storage
            COMPARE;    # int : nat : lambda unit (list operation) : chain_id : pair nat (lambda unit (list operation)) : map key_hash signature : pair chain_id (pair nat (lambda unit (list operation))) : @parameter%submit : @storage
            EQ;         # bool : nat : lambda unit (list operation) : chain_id : pair nat (lambda unit (list operation)) : map key_hash signature : pair chain_id (pair nat (lambda unit (list operation))) : @parameter%submit : @storage
            IF
              {}
              {
                PUSH string "BAD_CHAIN_ID"; # string : nat : lambda unit (list operation) : chain_id : pair nat (lambda unit (list operation)) : map key_hash signature : pair chain_id (pair nat (lambda unit (list operation))) : @parameter%submit : @storage
                FAILWITH;   # FAILED
              }; # nat : lambda unit (list operation) : chain_id : pair nat (lambda unit (list operation)) : map key_hash signature : pair chain_id (pair nat (lambda unit (list operation))) : @parameter%submit : @storage
            # sp.verify(match_pair_106_fst == (self.data.operationId + 1), message = 'BAD_OP_ID') # nat : lambda unit (list operation) : chain_id : pair nat (lambda unit (list operation)) : map key_hash signature : pair chain_id (pair nat (lambda unit (list operation))) : @parameter%submit : @storage
            PUSH nat 1; # nat : nat : lambda unit (list operation) : chain_id : pair nat (lambda unit (list operation)) : map key_hash signature : pair chain_id (pair nat (lambda unit (list operation))) : @parameter%submit : @storage
            DUP 9;      # @storage : nat : nat : lambda unit (list operation) : chain_id : pair nat (lambda unit (list operation)) : map key_hash signature : pair chain_id (pair nat (lambda unit (list operation))) : @parameter%submit : @storage
            CAR;        # pair (nat %operationId) (list %signers key) : nat : nat : lambda unit (list operation) : chain_id : pair nat (lambda unit (list operation)) : map key_hash signature : pair chain_id (pair nat (lambda unit (list operation))) : @parameter%submit : @storage
            CAR;        # nat : nat : nat : lambda unit (list operation) : chain_id : pair nat (lambda unit (list operation)) : map key_hash signature : pair chain_id (pair nat (lambda unit (list operation))) : @parameter%submit : @storage
            ADD;        # nat : nat : lambda unit (list operation) : chain_id : pair nat (lambda unit (list operation)) : map key_hash signature : pair chain_id (pair nat (lambda unit (list operation))) : @parameter%submit : @storage
            SWAP;       # nat : nat : lambda unit (list operation) : chain_id : pair nat (lambda unit (list operation)) : map key_hash signature : pair chain_id (pair nat (lambda unit (list operation))) : @parameter%submit : @storage
            DUP;        # nat : nat : nat : lambda unit (list operation) : chain_id : pair nat (lambda unit (list operation)) : map key_hash signature : pair chain_id (pair nat (lambda unit (list operation))) : @parameter%submit : @storage
            DUG 2;      # nat : nat : nat : lambda unit (list operation) : chain_id : pair nat (lambda unit (list operation)) : map key_hash signature : pair chain_id (pair nat (lambda unit (list operation))) : @parameter%submit : @storage
            COMPARE;    # int : nat : lambda unit (list operation) : chain_id : pair nat (lambda unit (list operation)) : map key_hash signature : pair chain_id (pair nat (lambda unit (list operation))) : @parameter%submit : @storage
            EQ;         # bool : nat : lambda unit (list operation) : chain_id : pair nat (lambda unit (list operation)) : map key_hash signature : pair chain_id (pair nat (lambda unit (list operation))) : @parameter%submit : @storage
            IF
              {}
              {
                PUSH string "BAD_OP_ID"; # string : nat : lambda unit (list operation) : chain_id : pair nat (lambda unit (list operation)) : map key_hash signature : pair chain_id (pair nat (lambda unit (list operation))) : @parameter%submit : @storage
                FAILWITH;   # FAILED
              }; # nat : lambda unit (list operation) : chain_id : pair nat (lambda unit (list operation)) : map key_hash signature : pair chain_id (pair nat (lambda unit (list operation))) : @parameter%submit : @storage
            # valid_signatures_counter = sp.local("valid_signatures_counter", 0) # nat : lambda unit (list operation) : chain_id : pair nat (lambda unit (list operation)) : map key_hash signature : pair chain_id (pair nat (lambda unit (list operation))) : @parameter%submit : @storage
            PUSH nat 0; # nat : nat : lambda unit (list operation) : chain_id : pair nat (lambda unit (list operation)) : map key_hash signature : pair chain_id (pair nat (lambda unit (list operation))) : @parameter%submit : @storage
            # for signer in self.data.signers: ... # nat : nat : lambda unit (list operation) : chain_id : pair nat (lambda unit (list operation)) : map key_hash signature : pair chain_id (pair nat (lambda unit (list operation))) : @parameter%submit : @storage
            DUP 9;      # @storage : nat : nat : lambda unit (list operation) : chain_id : pair nat (lambda unit (list operation)) : map key_hash signature : pair chain_id (pair nat (lambda unit (list operation))) : @parameter%submit : @storage
            CAR;        # pair (nat %operationId) (list %signers key) : nat : nat : lambda unit (list operation) : chain_id : pair nat (lambda unit (list operation)) : map key_hash signature : pair chain_id (pair nat (lambda unit (list operation))) : @parameter%submit : @storage
            CDR;        # list key : nat : nat : lambda unit (list operation) : chain_id : pair nat (lambda unit (list operation)) : map key_hash signature : pair chain_id (pair nat (lambda unit (list operation))) : @parameter%submit : @storage
            ITER
              {
                # if match_pair_102_fst.contains(sp.hash_key(signer)): # key : nat : nat : lambda unit (list operation) : chain_id : pair nat (lambda unit (list operation)) : map key_hash signature : pair chain_id (pair nat (lambda unit (list operation))) : @parameter%submit : @storage
                DUP 7;      # map key_hash signature : key : nat : nat : lambda unit (list operation) : chain_id : pair nat (lambda unit (list operation)) : map key_hash signature : pair chain_id (pair nat (lambda unit (list operation))) : @parameter%submit : @storage
                SWAP;       # key : map key_hash signature : nat : nat : lambda unit (list operation) : chain_id : pair nat (lambda unit (list operation)) : map key_hash signature : pair chain_id (pair nat (lambda unit (list operation))) : @parameter%submit : @storage
                DUP;        # key : key : map key_hash signature : nat : nat : lambda unit (list operation) : chain_id : pair nat (lambda unit (list operation)) : map key_hash signature : pair chain_id (pair nat (lambda unit (list operation))) : @parameter%submit : @storage
                DUG 2;      # key : map key_hash signature : key : nat : nat : lambda unit (list operation) : chain_id : pair nat (lambda unit (list operation)) : map key_hash signature : pair chain_id (pair nat (lambda unit (list operation))) : @parameter%submit : @storage
                HASH_KEY;   # key_hash : map key_hash signature : key : nat : nat : lambda unit (list operation) : chain_id : pair nat (lambda unit (list operation)) : map key_hash signature : pair chain_id (pair nat (lambda unit (list operation))) : @parameter%submit : @storage
                MEM;        # bool : key : nat : nat : lambda unit (list operation) : chain_id : pair nat (lambda unit (list operation)) : map key_hash signature : pair chain_id (pair nat (lambda unit (list operation))) : @parameter%submit : @storage
                IF
                  {
                    # sp.verify(sp.check_signature(signer, match_pair_102_fst[sp.hash_key(signer)], sp.pack(match_pair_102_snd)), message = 'BAD_SIGNATURE') # key : nat : nat : lambda unit (list operation) : chain_id : pair nat (lambda unit (list operation)) : map key_hash signature : pair chain_id (pair nat (lambda unit (list operation))) : @parameter%submit : @storage
                    DUP 8;      # pair chain_id (pair nat (lambda unit (list operation))) : key : nat : nat : lambda unit (list operation) : chain_id : pair nat (lambda unit (list operation)) : map key_hash signature : pair chain_id (pair nat (lambda unit (list operation))) : @parameter%submit : @storage
                    PACK;       # bytes : key : nat : nat : lambda unit (list operation) : chain_id : pair nat (lambda unit (list operation)) : map key_hash signature : pair chain_id (pair nat (lambda unit (list operation))) : @parameter%submit : @storage
                    DUP 8;      # map key_hash signature : bytes : key : nat : nat : lambda unit (list operation) : chain_id : pair nat (lambda unit (list operation)) : map key_hash signature : pair chain_id (pair nat (lambda unit (list operation))) : @parameter%submit : @storage
                    DUP 3;      # key : map key_hash signature : bytes : key : nat : nat : lambda unit (list operation) : chain_id : pair nat (lambda unit (list operation)) : map key_hash signature : pair chain_id (pair nat (lambda unit (list operation))) : @parameter%submit : @storage
                    HASH_KEY;   # key_hash : map key_hash signature : bytes : key : nat : nat : lambda unit (list operation) : chain_id : pair nat (lambda unit (list operation)) : map key_hash signature : pair chain_id (pair nat (lambda unit (list operation))) : @parameter%submit : @storage
                    GET;        # option signature : bytes : key : nat : nat : lambda unit (list operation) : chain_id : pair nat (lambda unit (list operation)) : map key_hash signature : pair chain_id (pair nat (lambda unit (list operation))) : @parameter%submit : @storage
                    IF_SOME
                      {
                        # of_some: Get-item:120 # @some : bytes : key : nat : nat : lambda unit (list operation) : chain_id : pair nat (lambda unit (list operation)) : map key_hash signature : pair chain_id (pair nat (lambda unit (list operation))) : @parameter%submit : @storage
                      }
                      {
                        PUSH int 120; # int : bytes : key : nat : nat : lambda unit (list operation) : chain_id : pair nat (lambda unit (list operation)) : map key_hash signature : pair chain_id (pair nat (lambda unit (list operation))) : @parameter%submit : @storage
                        FAILWITH;   # FAILED
                      }; # @some : bytes : key : nat : nat : lambda unit (list operation) : chain_id : pair nat (lambda unit (list operation)) : map key_hash signature : pair chain_id (pair nat (lambda unit (list operation))) : @parameter%submit : @storage
                    DIG 2;      # key : @some : bytes : nat : nat : lambda unit (list operation) : chain_id : pair nat (lambda unit (list operation)) : map key_hash signature : pair chain_id (pair nat (lambda unit (list operation))) : @parameter%submit : @storage
                    CHECK_SIGNATURE; # bool : nat : nat : lambda unit (list operation) : chain_id : pair nat (lambda unit (list operation)) : map key_hash signature : pair chain_id (pair nat (lambda unit (list operation))) : @parameter%submit : @storage
                    IF
                      {}
                      {
                        PUSH string "BAD_SIGNATURE"; # string : nat : nat : lambda unit (list operation) : chain_id : pair nat (lambda unit (list operation)) : map key_hash signature : pair chain_id (pair nat (lambda unit (list operation))) : @parameter%submit : @storage
                        FAILWITH;   # FAILED
                      }; # nat : nat : lambda unit (list operation) : chain_id : pair nat (lambda unit (list operation)) : map key_hash signature : pair chain_id (pair nat (lambda unit (list operation))) : @parameter%submit : @storage
                    # valid_signatures_counter.value += 1 # nat : nat : lambda unit (list operation) : chain_id : pair nat (lambda unit (list operation)) : map key_hash signature : pair chain_id (pair nat (lambda unit (list operation))) : @parameter%submit : @storage
                    PUSH nat 1; # nat : nat : nat : lambda unit (list operation) : chain_id : pair nat (lambda unit (list operation)) : map key_hash signature : pair chain_id (pair nat (lambda unit (list operation))) : @parameter%submit : @storage
                    ADD;        # nat : nat : lambda unit (list operation) : chain_id : pair nat (lambda unit (list operation)) : map key_hash signature : pair chain_id (pair nat (lambda unit (list operation))) : @parameter%submit : @storage
                  }
                  {
                    DROP;       # nat : nat : lambda unit (list operation) : chain_id : pair nat (lambda unit (list operation)) : map key_hash signature : pair chain_id (pair nat (lambda unit (list operation))) : @parameter%submit : @storage
                  }; # nat : nat : lambda unit (list operation) : chain_id : pair nat (lambda unit (list operation)) : map key_hash signature : pair chain_id (pair nat (lambda unit (list operation))) : @parameter%submit : @storage
              }; # nat : nat : lambda unit (list operation) : chain_id : pair nat (lambda unit (list operation)) : map key_hash signature : pair chain_id (pair nat (lambda unit (list operation))) : @parameter%submit : @storage
            SWAP;       # nat : nat : lambda unit (list operation) : chain_id : pair nat (lambda unit (list operation)) : map key_hash signature : pair chain_id (pair nat (lambda unit (list operation))) : @parameter%submit : @storage
            DROP;       # nat : lambda unit (list operation) : chain_id : pair nat (lambda unit (list operation)) : map key_hash signature : pair chain_id (pair nat (lambda unit (list operation))) : @parameter%submit : @storage
            DIG 2;      # chain_id : nat : lambda unit (list operation) : pair nat (lambda unit (list operation)) : map key_hash signature : pair chain_id (pair nat (lambda unit (list operation))) : @parameter%submit : @storage
            DROP;       # nat : lambda unit (list operation) : pair nat (lambda unit (list operation)) : map key_hash signature : pair chain_id (pair nat (lambda unit (list operation))) : @parameter%submit : @storage
            DIG 2;      # pair nat (lambda unit (list operation)) : nat : lambda unit (list operation) : map key_hash signature : pair chain_id (pair nat (lambda unit (list operation))) : @parameter%submit : @storage
            DROP;       # nat : lambda unit (list operation) : map key_hash signature : pair chain_id (pair nat (lambda unit (list operation))) : @parameter%submit : @storage
            DIG 2;      # map key_hash signature : nat : lambda unit (list operation) : pair chain_id (pair nat (lambda unit (list operation))) : @parameter%submit : @storage
            DROP;       # nat : lambda unit (list operation) : pair chain_id (pair nat (lambda unit (list operation))) : @parameter%submit : @storage
            DIG 2;      # pair chain_id (pair nat (lambda unit (list operation))) : nat : lambda unit (list operation) : @parameter%submit : @storage
            DROP;       # nat : lambda unit (list operation) : @parameter%submit : @storage
            DIG 2;      # @parameter%submit : nat : lambda unit (list operation) : @storage
            DROP;       # nat : lambda unit (list operation) : @storage
            # sp.verify(valid_signatures_counter.value >= self.data.threshold, message = 'TOO_FEW_SIGS') # nat : lambda unit (list operation) : @storage
            DUP 3;      # @storage : nat : lambda unit (list operation) : @storage
            GET 3;      # nat : nat : lambda unit (list operation) : @storage
            SWAP;       # nat : nat : lambda unit (list operation) : @storage
            COMPARE;    # int : lambda unit (list operation) : @storage
            GE;         # bool : lambda unit (list operation) : @storage
            IF
              {}
              {
                PUSH string "TOO_FEW_SIGS"; # string : lambda unit (list operation) : @storage
                FAILWITH;   # FAILED
              }; # lambda unit (list operation) : @storage
            SWAP;       # @storage : lambda unit (list operation)
            # self.data.operationId += 1 # @storage : lambda unit (list operation)
            UNPAIR;     # pair (nat %operationId) (list %signers key) : pair (nat %threshold) (pair (big_map %timelock nat (pair timestamp (lambda unit (list operation)))) (nat %timelockSeconds)) : lambda unit (list operation)
            UNPAIR;     # nat : list key : pair (nat %threshold) (pair (big_map %timelock nat (pair timestamp (lambda unit (list operation)))) (nat %timelockSeconds)) : lambda unit (list operation)
            PUSH nat 1; # nat : nat : list key : pair (nat %threshold) (pair (big_map %timelock nat (pair timestamp (lambda unit (list operation)))) (nat %timelockSeconds)) : lambda unit (list operation)
            ADD;        # nat : list key : pair (nat %threshold) (pair (big_map %timelock nat (pair timestamp (lambda unit (list operation)))) (nat %timelockSeconds)) : lambda unit (list operation)
            PAIR;       # pair nat (list key) : pair (nat %threshold) (pair (big_map %timelock nat (pair timestamp (lambda unit (list operation)))) (nat %timelockSeconds)) : lambda unit (list operation)
            PAIR;       # pair (pair nat (list key)) (pair (nat %threshold) (pair (big_map %timelock nat (pair timestamp (lambda unit (list operation)))) (nat %timelockSeconds))) : lambda unit (list operation)
            # self.data.timelock[self.data.operationId] = (sp.now, match_pair_106_snd) # pair (pair nat (list key)) (pair (nat %threshold) (pair (big_map %timelock nat (pair timestamp (lambda unit (list operation)))) (nat %timelockSeconds))) : lambda unit (list operation)
            DUP;        # pair (pair nat (list key)) (pair (nat %threshold) (pair (big_map %timelock nat (pair timestamp (lambda unit (list operation)))) (nat %timelockSeconds))) : pair (pair nat (list key)) (pair (nat %threshold) (pair (big_map %timelock nat (pair timestamp (lambda unit (list operation)))) (nat %timelockSeconds))) : lambda unit (list operation)
            DUG 2;      # pair (pair nat (list key)) (pair (nat %threshold) (pair (big_map %timelock nat (pair timestamp (lambda unit (list operation)))) (nat %timelockSeconds))) : lambda unit (list operation) : pair (pair nat (list key)) (pair (nat %threshold) (pair (big_map %timelock nat (pair timestamp (lambda unit (list operation)))) (nat %timelockSeconds)))
            UNPAIR;     # pair nat (list key) : pair (nat %threshold) (pair (big_map %timelock nat (pair timestamp (lambda unit (list operation)))) (nat %timelockSeconds)) : lambda unit (list operation) : pair (pair nat (list key)) (pair (nat %threshold) (pair (big_map %timelock nat (pair timestamp (lambda unit (list operation)))) (nat %timelockSeconds)))
            SWAP;       # pair (nat %threshold) (pair (big_map %timelock nat (pair timestamp (lambda unit (list operation)))) (nat %timelockSeconds)) : pair nat (list key) : lambda unit (list operation) : pair (pair nat (list key)) (pair (nat %threshold) (pair (big_map %timelock nat (pair timestamp (lambda unit (list operation)))) (nat %timelockSeconds)))
            UNPAIR;     # nat : pair (big_map %timelock nat (pair timestamp (lambda unit (list operation)))) (nat %timelockSeconds) : pair nat (list key) : lambda unit (list operation) : pair (pair nat (list key)) (pair (nat %threshold) (pair (big_map %timelock nat (pair timestamp (lambda unit (list operation)))) (nat %timelockSeconds)))
            SWAP;       # pair (big_map %timelock nat (pair timestamp (lambda unit (list operation)))) (nat %timelockSeconds) : nat : pair nat (list key) : lambda unit (list operation) : pair (pair nat (list key)) (pair (nat %threshold) (pair (big_map %timelock nat (pair timestamp (lambda unit (list operation)))) (nat %timelockSeconds)))
            UNPAIR;     # big_map nat (pair timestamp (lambda unit (list operation))) : nat : nat : pair nat (list key) : lambda unit (list operation) : pair (pair nat (list key)) (pair (nat %threshold) (pair (big_map %timelock nat (pair timestamp (lambda unit (list operation)))) (nat %timelockSeconds)))
            DIG 4;      # lambda unit (list operation) : big_map nat (pair timestamp (lambda unit (list operation))) : nat : nat : pair nat (list key) : pair (pair nat (list key)) (pair (nat %threshold) (pair (big_map %timelock nat (pair timestamp (lambda unit (list operation)))) (nat %timelockSeconds)))
            NOW;        # timestamp : lambda unit (list operation) : big_map nat (pair timestamp (lambda unit (list operation))) : nat : nat : pair nat (list key) : pair (pair nat (list key)) (pair (nat %threshold) (pair (big_map %timelock nat (pair timestamp (lambda unit (list operation)))) (nat %timelockSeconds)))
            PAIR;       # pair timestamp (lambda unit (list operation)) : big_map nat (pair timestamp (lambda unit (list operation))) : nat : nat : pair nat (list key) : pair (pair nat (list key)) (pair (nat %threshold) (pair (big_map %timelock nat (pair timestamp (lambda unit (list operation)))) (nat %timelockSeconds)))
            SOME;       # option (pair timestamp (lambda unit (list operation))) : big_map nat (pair timestamp (lambda unit (list operation))) : nat : nat : pair nat (list key) : pair (pair nat (list key)) (pair (nat %threshold) (pair (big_map %timelock nat (pair timestamp (lambda unit (list operation)))) (nat %timelockSeconds)))
            DIG 5;      # pair (pair nat (list key)) (pair (nat %threshold) (pair (big_map %timelock nat (pair timestamp (lambda unit (list operation)))) (nat %timelockSeconds))) : option (pair timestamp (lambda unit (list operation))) : big_map nat (pair timestamp (lambda unit (list operation))) : nat : nat : pair nat (list key)
            CAR;        # pair nat (list key) : option (pair timestamp (lambda unit (list operation))) : big_map nat (pair timestamp (lambda unit (list operation))) : nat : nat : pair nat (list key)
            CAR;        # nat : option (pair timestamp (lambda unit (list operation))) : big_map nat (pair timestamp (lambda unit (list operation))) : nat : nat : pair nat (list key)
            UPDATE;     # big_map nat (pair timestamp (lambda unit (list operation))) : nat : nat : pair nat (list key)
            PAIR;       # pair (big_map nat (pair timestamp (lambda unit (list operation)))) nat : nat : pair nat (list key)
            SWAP;       # nat : pair (big_map nat (pair timestamp (lambda unit (list operation)))) nat : pair nat (list key)
            PAIR;       # pair nat (pair (big_map nat (pair timestamp (lambda unit (list operation)))) nat) : pair nat (list key)
            SWAP;       # pair nat (list key) : pair nat (pair (big_map nat (pair timestamp (lambda unit (list operation)))) nat)
            PAIR;       # pair (pair nat (list key)) (pair nat (pair (big_map nat (pair timestamp (lambda unit (list operation)))) nat))
          }; # pair (pair nat (list key)) (pair nat (pair (big_map nat (pair timestamp (lambda unit (list operation)))) nat))
        NIL operation; # list operation : pair (pair nat (list key)) (pair nat (pair (big_map nat (pair timestamp (lambda unit (list operation)))) nat))
      }; # list operation : pair (pair nat (list key)) (pair nat (pair (big_map nat (pair timestamp (lambda unit (list operation)))) nat))
    NIL operation; # list operation : list operation : pair (pair nat (list key)) (pair nat (pair (big_map nat (pair timestamp (lambda unit (list operation)))) nat))
    SWAP;       # list operation : list operation : pair (pair nat (list key)) (pair nat (pair (big_map nat (pair timestamp (lambda unit (list operation)))) nat))
    ITER
      {
        CONS;       # list operation : pair (pair nat (list key)) (pair nat (pair (big_map nat (pair timestamp (lambda unit (list operation)))) nat))
      }; # list operation : pair (pair nat (list key)) (pair nat (pair (big_map nat (pair timestamp (lambda unit (list operation)))) nat))
    PAIR;       # pair (list operation) (pair (pair nat (list key)) (pair nat (pair (big_map nat (pair timestamp (lambda unit (list operation)))) nat)))
  };`;

        const storage: string = DeployPairMichelson(deploy);

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
            TezosParameterFormat.Michelson);
        return TezosContractUtils.clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }

    export type SignatureMap = { [address: string]: string}; // address -> signature map

    /*
     * Returns a SignatureMap in Michelson format
     *
     * @param signatures
     */
    export function SignatureMapMichelson(signatures: SignatureMap): string {
        let signaturesMichelson = `{ `;
        for (let address in signatures) {
            signaturesMichelson += `Elt "${address}" "${signatures[address]}"; `;
        }
        signaturesMichelson += `}`;
        return signaturesMichelson;
    }

    /*
     * Returns a SignatureMap in Micheline format
     *
     * @param signatures
     */
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

    /*
     * Payload to sign for Submit entrypoint
     *
     * @param chainid The chain id to execute on
     * @param operationId The current operation id of the contract
     * @param payload The lambda to execute. Must be in Michelson.
     */
    export interface ExecutionRequest {
        chainId: string | undefined;
        operationId: number | undefined;
        payload: string;
    }

    /*
     * Returns an ExecutionRequest in Michelson format
     *
     * @param executionRequest
     */
    export function ExecutionRequestMichelson(executionRequest: ExecutionRequest): string {
        return `(Pair ${executionRequest.chainId} (Pair ${executionRequest.operationId} ${executionRequest.payload} ))`;
    }

    /*
     * Return an ExecutionRequest in Micheline format
     *
     * @param executionRequest
     */
    export function ExecutionRequestMicheline(executionRequest: ExecutionRequest): string {
        return `{
            "prim": "Pair",
            "args": [
              { "bytes": "${executionRequest.chainId}" },
              {
                "prim": "Pair",
                "args": [
                  { "int": "${executionRequest.operationId}" },
                  ${executionRequest.payload}
                ]
              }
            ]
        }`;
    }

    /*
     * Returns the bytes to sign for submit call
     * @params timelockId The id of the operation to cancel
     * @params operationId The current operation id of the contract
     */
    export function executionRequestBytesToSign(executionRequest: ExecutionRequest): string {
        // get chainid
        // get operationId if undefined
        // create michelson
        // encode
        return '';
    }

    /*
     * Returns the signed ExecutionRequest
     *
     * @param signer ConseilJS Signer object
     * @param executionRequest The execution request to sign
     */
    export async function SignExecutionRequest(signer: Signer, executionRequest: ExecutionRequest): Promise<Buffer> {
        return Buffer.from(''); // TODO
    }

    /* Submit entrypoint parameters
     *
     * @param signatures A SignatureMap with the ExecutionRequests' Michelson payload signed
     * @param executionRequest The invocation payload
     */
    export interface SubmitPair {
        signatures: SignatureMap;
        executionRequest: ExecutionRequest;
    }

    /*
     * Returns a SubmitPair in Michelson format
     *
     * @param submit
     */
    export function SubmitPairMichelson(submit: SubmitPair): string {
        const signatures = SignatureMapMichelson(submit.signatures);
        const executionRequest = ExecutionRequestMichelson(submit.executionRequest)
        console.log(signatures);
        console.log(executionRequest);
        return `(Right (Right (Pair ${signatures} ${executionRequest} )))`;
    }

    /*
     * Returns a SubmitPair in Micheline format
     *
     * @param submit
     */
    export function SubmitPairMicheline(submit: SubmitPair): string {
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
                      ${ExecutionRequestMicheline(submit.executionRequest)}
                    ]
                  }
                ]
              }
            ]
          }`;
    }

    /*
     * Invokes the Submit entrypoint of the specified timelock contract.
     *
     * @param server
     * @param signer
     * @param keystore
     * @param address
     * @param submit
     * @param amount
     * @param fee
     * @param gas
     * @param freight
     */
    export async function Submit(server: string, signer: Signer, keystore: KeyStore, address: string, submit: SubmitPair, amount: number, fee: number, gas: number, freight: number): Promise<string> {
        const entrypoint = `submit`;

        // get chainId of mainnet if not specified
        if (!submit.executionRequest.chainId) {
            const chainId: string = await TezosNodeReader.getChainId(server);
            submit.executionRequest.chainId = ``; // TODO: this needs to be encoded NetXSgo1ZT2DRUG -> 0x9caecab9
        }

        // get current operationId if not specified
        if (!submit.executionRequest.operationId) {
            const storage = await getStorage(server, address);
            submit.executionRequest.operationId = storage.operationId;
        }

        let parameter: string = SubmitPairMichelson(submit);
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
            parameter,
            TezosParameterFormat.Michelson);
        return TezosContractUtils.clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }

    /*
     * RotateRequest
     *
     * @param chainid The chain id to execute on
     * @param operationId The current operation id of the contract
     * @param payload The new threshold and set of keys
     */
    export interface RotateRequest {
        chainId: string | undefined;
        operationId: number | undefined;
        payload: {
            threshold: number;
            keys: string[];
        }
    }

    // TODO: add michelson and micheline

    /*
     * Return the bytes to sign for key rotation call
     *
     * @param threshold The new threshold
     * @param keys The new list of keys
     * @param operationId The current operation id of the contract
     */
    export function rotateRequestBytesToSign(rotateRequest: RotateRequest): string {
        // get chainid
        // get operationId if undefined
        // create michelson
        // encode
        return '';
    }

    /*
     * Rotate entrypoint parameters
     *
     */
    export interface RotatePair {
        signatures: SignatureMap;
        rotateRequest: RotateRequest;
    }

    /*
     * Returns a RotatePair in Michelson format
     * @param rotate
     */
    export function RotatePairMichelson(rotate: RotatePair): string {
        return ``;

    /*
     * Returns a RotatePair in Micheline format
     * @param rotate
     */
    export function RotatePairMicheline(rotate: RotatePair): string {
        return ``;
    }

    /*
     * CancelRequest
     *
     * @param chainid The chain id to execute operation
     * @param operationId The current operation id of the contract
     * @param timelockId The id of the operation to cancel
     */
    export interface CancelRequest {
        chainId: string | undefined;
        operationId: number | undefined;
        timelockId: number;
    }

    // TODO: add michelson and micheline

    /*
     * Returns the bytes to sign for operation cancellation call
     * @params timelockId The id of the operation to cancel
     * @params operationId The current operation id of the contract
     */
    export function cancelRequestBytesToSign(timelockId: number, operationId: number | undefined = undefined): string {
        // get chainid
        // get operationId if undefined
        // create michelson
        // encode
        return '';
    }

    /*
     * Cancel entrypoint parameters
     *
     */
    export interface CancelPair {
        signatures: SignatureMap;
        cancelRequest: CancelRequest;
    }

    /*
     * Returns a CancelPair in Michelson format
     * @param cancel
     */
    export function CancelPairMichelson(cancel: CancelPair): string {
        return ``;

    /*
     * Returns a CancelPair in Micheline format
     * @param cancel
     */
    export function CancelPairMicheline(cancel: CancelPair): string {
        return ``;
    }

    // TODO: add entrypoint invocation

    /*
     * Execute entrypoint parameters
     *
     * @param operationId The id of the operation to execute
     */
    export interface ExecutePair {
        operationId: number;
    }

    /*
     * Returns a ExecutePair in Michelson format
     * @param execute
     */
    export function ExecutePairMichelson(execute: ExecutePair): string {
        return ``;

    /*
     * Returns a ExecutePair in Micheline format
     * @param execute
     */
    export function ExecutePairMicheline(execute: ExecutePair): string {
        return ``;
    }

    // TODO: add entrypoint invocation

    /*
     * Get a Timelock instance by querying a given address
     * @param server The Tezos node to communicate with
     * @param address The deployed Timelock contract address
     */
    export async function getStorage(server: string, address: string): Promise<Storage> {
        const storageResult = await TezosNodeReader.getContractStorage(server, address);
        return {
            operationId: Number(JSONPath({ path: '$.args[0].args[0].int', json: storageResult })[0]),
            keys: JSONPath({ path: '$.args[0].args[1]', json: storageResult })[0].map(k => JSONPath({path: '$.string', json: k})),
            threshold: Number(JSONPath({ path: '$.args[1].int', json: storageResult })[0]),
            mapid: Number(JSONPath({ path: '$.args[2].int', json: storageResult })[0]),
            timelockSeconds: Number(JSONPath({ path: '$.args[3].int', json: storageResult })[0])
        }
    }
}

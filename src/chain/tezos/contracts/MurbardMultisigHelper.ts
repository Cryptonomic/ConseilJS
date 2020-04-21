import * as blakejs from 'blakejs';
import { JSONPath } from 'jsonpath-plus';

import { TezosLanguageUtil } from '../TezosLanguageUtil';
import { TezosNodeReader } from '../TezosNodeReader';
import { TezosNodeWriter } from '../TezosNodeWriter';
import { KeyStore } from '../../../types/wallet/KeyStore';
import * as TezosTypes from '../../../types/tezos/TezosChainTypes';

export namespace MurbardMultisigHelper {
    /**
     * Gets the contract code at the specified address at the head block and compares it to the known hash of the code. This function processes Micheline format contracts.
     * 
     * @param server Destination Tezos node.
     * @param address Contract address to query.
     */
    export async function verifyDestination(server: string, address: string): Promise<boolean> {
        const contract = await TezosNodeReader.getAccountForBlock(server, 'head', address);

        if (!!!contract.script) { throw new Error(`No code found at ${address}`); }

        const k = Buffer.from(blakejs.blake2s(JSON.stringify(contract.script.code), null, 16)).toString('hex');

        if (k !== '914629850cfdad7b54a8c5a661d10bd0') { throw new Error(`Contract does not match the expected code hash: ${k}, '914629850cfdad7b54a8c5a661d10bd0'`); }

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

    export async function getSimpleStorage(server: string, address: string): Promise<{ counter: number, threshold: number, keys: string[] }> {
        const storageResult = await TezosNodeReader.getContractStorage(server, address);

        return {
            counter: Number(JSONPath({ path: '$.args[0].int', json: storageResult })[0]),
            threshold: Number(JSONPath({ path: '$.args[1].args[0].int', json: storageResult })[0]),
            keys: JSONPath({ path: '$.args[1].args[1]..string', json: storageResult })
        };
    }

    /**
     * Sample multi-sig contract retrieved in April 2020.
     * https://github.com/murbard/smart-contracts/blob/master/multisig/michelson/multisig.tzip
     */
    export async function deployContract(server: string, keyStore: KeyStore, delegate: string, fee: number, amount: number, counter: number, threshold: number, keys: string[], derivationPath: string = ''): Promise<string> {
        if (threshold > keys.length) { throw new Error('Number of keys provided is lower than the threshold'); }

        const code = `parameter (pair (pair :payload (nat %counter) (or :action (pair :transfer (mutez %amount) (contract %dest unit)) (or (option %delegate key_hash) (pair %change_keys (nat %threshold) (list %keys key))))) (list %sigs (option signature)));
        storage (pair (nat %stored_counter) (pair (nat %threshold) (list %keys key)));
        code
          {
            UNPAIR ; SWAP ; DUP ; DIP { SWAP } ;
            DIP
              {
                UNPAIR ;
                DUP ; SELF ; ADDRESS ; CHAIN_ID ; PAIR ; PAIR ;
                PACK ;
                DIP { UNPAIR @counter ; DIP { SWAP } } ; SWAP
              } ;
            UNPAIR @stored_counter; DIP { SWAP };
            ASSERT_CMPEQ ;
            DIP { SWAP } ; UNPAIR @threshold @keys;
            DIP
              {
                PUSH @valid nat 0; SWAP ;
                ITER
                  {
                    DIP { SWAP } ; SWAP ;
                    IF_CONS
                      {
                        IF_SOME
                          { SWAP ;
                            DIP
                              {
                                SWAP ; DIIP { DUUP } ;
                                CHECK_SIGNATURE ; ASSERT ;
                                PUSH nat 1 ; ADD @valid } }
                          { SWAP ; DROP }
                      }
                      {
                        FAIL
                      } ;
                    SWAP
                  }
              } ;
            ASSERT_CMPLE ;
            DROP ; DROP ;
            DIP { UNPAIR ; PUSH nat 1 ; ADD @new_counter ; PAIR} ;
            NIL operation ; SWAP ;
            IF_LEFT
              {
                UNPAIR ; UNIT ; TRANSFER_TOKENS ; CONS }
              { IF_LEFT {
                          SET_DELEGATE ; CONS }
                        {
                          DIP { SWAP ; CAR } ; SWAP ; PAIR ; SWAP }} ;
            PAIR }`;
        const storage = `(Pair ${counter} (Pair ${threshold} { "${keys.join('" ; "') }" } ) )`;

        const nodeResult = await TezosNodeWriter.sendContractOriginationOperation(server, keyStore, amount, delegate, fee, derivationPath, 5_000, 120_000, code, storage, TezosTypes.TezosParameterFormat.Michelson);
        return clearRPCOperationGroupHash(nodeResult['operationGroupID']);
    }

    function clearRPCOperationGroupHash(hash: string): string {
        return hash.replace(/\"/g, '').replace(/\n/, '');
    }
}

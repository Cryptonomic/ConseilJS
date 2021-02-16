import { JSONPath } from 'jsonpath-plus';

import { KeyStore, Signer } from '../../../types/ExternalInterfaces';
import * as TezosTypes from '../../../types/tezos/TezosChainTypes';
import { TezosMessageUtils } from '../TezosMessageUtil';
import { TezosNodeReader } from '../TezosNodeReader';
import { TezosNodeWriter } from '../TezosNodeWriter';
import { TezosContractUtils } from './TezosContractUtils';

/** The expected checksum for the StakerDao Tzip 7 contract. */
const CONTRACT_CHECKSUMS = {
  token: 'd48b45bd77d2300026fe617c5ba7670e',
}

/** The expected checksum for the StakerDao Tzip 7 script. */
const SCRIPT_CHECKSUMS = {
  // TODO(keefertaylor): Compute this checksum correctly.
  token: '',
}

export interface StakerDaoTzip7Storage {
  balanceMap: number;
  approvalsMap: number;
  supply: number;
  administrator: string;
  paused: boolean;
  pauseGuardian: string;
  outcomeMap: number;
  swapMap: number;
}

export interface StakerDaoTzip7BalanceRecord { }
export interface StakerDaoTzip7ApprovalRecord { }
export interface StakerDaoTzip7OutcomeRecord { }
export interface StakerDaoTzip7SwapRecord { }

/**
 * Interface for a StakerDAO implementation of TZIP-7, AKA FA 1.2.
 *
 * @author Keefer Taylor, Staker Services Ltd <keefer@stakerdao.com>
 */
export const StakerDaoTzip7 = {
  /**
   * Verifies that contract code for StakerDao's Tzip7 contract matches the expected code.
   * 
   * Note: This function processes contracts in the Micheline format.
   * 
   * @param nodeUrl The URL of the Tezos node which serves data.
   * @param tokenContractAddress The address of the token contract.
   * @returns A boolean indicating if the code was the expected sum.
   */
  verifyDestination: async function (
    nodeUrl: string,
    tokenContractAddress: string
  ): Promise<boolean> {
    return await TezosContractUtils.verifyDestination(nodeUrl, tokenContractAddress, CONTRACT_CHECKSUMS.token)
  },

  /**
   * Verifies that Michelson script for StakerDao's Tzip7 contract matches the expected code.
   * 
   * Note: This function processes scrips in Michelson format.
   * 
   * @param tokenScript The script of the token contract.
   * @returns A boolean indicating if the code was the expected sum.
   */
  verifyScript: function (
    tokenScript: string,
  ): boolean {
    return TezosContractUtils.verifyScript(tokenScript, SCRIPT_CHECKSUMS.token)
  },

  /**
   * @param server
   * @param address
   */
  getSimpleStorage: async function (server: string, address: string): Promise<StakerDaoTzip7Storage> {
    const storageResult = await TezosNodeReader.getContractStorage(server, address);

    return {
      balanceMap: Number(JSONPath({ path: '$.args[1].args[0].args[1].args[0].int', json: storageResult })[0]),
      approvalsMap: Number(JSONPath({ path: '$.args[1].args[0].args[0].args[1].int', json: storageResult })[0]),
      supply: Number(JSONPath({ path: '$.args[1].args[1].args[1].int', json: storageResult })[0]),
      administrator: JSONPath({ path: '$.args[1].args[0].args[0].args[0].string', json: storageResult })[0],
      paused: (JSONPath({ path: '$.args[1].args[1].args[0].prim', json: storageResult })[0]).toString().toLowerCase().startsWith('t'),
      pauseGuardian: JSONPath({ path: '$.args[1].args[0].args[1].args[1].string', json: storageResult })[0],
      outcomeMap: Number(JSONPath({ path: '$.args[0].args[0].int', json: storageResult })[0]),
      swapMap: Number(JSONPath({ path: '$.args[0].args[1].int', json: storageResult })[0])
    };
  },

  /**
   * Get the balance of tokens for an address.
   * 
   * @param nodeUrl The URL of the Tezos node which serves data.
   * @param mapId The ID of the BigMap which contains balances.
   * @param account The account to fetch the token balance for.
   * @returns The balance of the account.
   */
  getAccountBalance: async function (server: string, mapid: number, account: string): Promise<number> {
    const packedKey = TezosMessageUtils.encodeBigMapKey(Buffer.from(TezosMessageUtils.writePackedData(account, 'address'), 'hex'));
    const mapResult = await TezosNodeReader.getValueForBigMapKey(server, mapid, packedKey);

    if (mapResult === undefined) { throw new Error(`Map ${mapid} does not contain a record for ${account}`); }

    const numberString = JSONPath({ path: '$.int', json: mapResult });
    return Number(numberString);
  },

  /**
   * Transfer some WXTZ between addresses.
   * 
   * @param nodeUrl The URL of the Tezos node which serves data.
   * @param signer A Signer for the sourceAddress.
   * @param keystore A Keystore for the sourceAddress.
   * @param tokenContractAddress The address of the token contract. 
   * @param fee The fee to use.
   * @param sourceAddress The address which will send tokens.
   * @param destinationAddress The address which will receive tokens.
   * @param amount The amount of tokens to send.
   * @param gasLimit The gas limit to use.
   * @param storageLimit The storage limit to use. 
   * @returns A string representing the operation hash.
   */
  transferBalance: async function (
    nodeUrl: string,
    signer: Signer,
    keystore: KeyStore,
    tokenContractAddress: string,
    fee: number,
    sourceAddress: string,
    destinationAddress: string,
    amount: number,
    gasLimit: number = 51_300,
    storageLimit: number = 70
  ): Promise<string> {
    const parameters = `Pair "${sourceAddress}" (Pair "${destinationAddress}" ${amount})`;

    const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(
      nodeUrl,
      signer,
      keystore,
      tokenContractAddress,
      0,
      fee,
      storageLimit,
      gasLimit,
      'transfer',
      parameters,
      TezosTypes.TezosParameterFormat.Michelson
    );

    return TezosContractUtils.clearRPCOperationGroupHash(nodeResult.operationGroupID);
  }
}

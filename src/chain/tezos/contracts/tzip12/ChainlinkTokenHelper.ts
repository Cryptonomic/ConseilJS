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
export namespace ChainlinkTokenHelper {
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
            tokenid: Number(JSONPath({ path: '$.args[0].int', json: mapResult })[0]),
            symbol: JSONPath({ path: '$.args[1].args[0].string', json: mapResult })[0],
            name: JSONPath({ path: '$.args[1].args[1].args[0].string', json: mapResult })[0],
            scale: Number(JSONPath({ path: '$.args[1].args[1].args[1].args[0].int', json: mapResult })[0]),
            // extra metadata: $.args[1].args[1].args[1].args[1]
        }
    }

    export async function transfer(server: string, address: string, signer: Signer, keystore: KeyStore, fee: number, source: string, transfers: TransferPair[], gas: number = 200_000, freight: number = 1_000): Promise<string> {
        const entryPoint = 'transfer';
        const parameters = `{ Pair "${source}" { ${transfers.map(t => `(Pair "${t.address}" (Pair ${t.tokenid}  ${t.balance}))`).join(' ; ')} } }`;

        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(server, signer, keystore, address, 0, fee, freight, gas, entryPoint, parameters, TezosTypes.TezosParameterFormat.Michelson);

        return TezosContractUtils.clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }

    export async function getAccountBalance(server: string, mapid: number, account: string): Promise<number> {
        const accountHex = `0x${TezosMessageUtils.writeAddress(account)}`;
        const packedKey = TezosMessageUtils.encodeBigMapKey(Buffer.from(TezosMessageUtils.writePackedData(`${accountHex}`, '', TezosTypes.TezosParameterFormat.Michelson), 'hex'));

        const mapResult = await TezosNodeReader.getValueForBigMapKey(server, mapid, packedKey);

        if (mapResult === undefined) { throw new Error(`Map ${mapid} does not contain a record for ${account}`); }

        const jsonresult = JSONPath({ path: '$.int', json: mapResult });
        return Number(jsonresult[0]);
    }
}

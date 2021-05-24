import {JSONPath} from 'jsonpath-plus';
import {KeyStore, Signer} from '../../../types/ExternalInterfaces';
import {TezosNodeReader} from '../TezosNodeReader';
import {TezosNodeWriter} from '../TezosNodeWriter';
import {ConseilOperator, ConseilSortDirection, ConseilServerInfo} from '../../../types/conseil/QueryTypes';
import {ConseilQueryBuilder} from '../../../reporting/ConseilQueryBuilder';
import {TezosConseilClient} from '../../../reporting/tezos/TezosConseilClient';
import {MultiAssetTokenHelper} from './tzip12/MultiAssetTokenHelper';
import {TezosParameterFormat} from '../../../types/tezos/TezosChainTypes';
import {TezosContractUtils} from './TezosContractUtils';

export namespace HicNFTHelper {
    /*
     * Type for representing Hic's FA2 contracts' storage.
     * @param administrator
     * @param allTokens
     * @param ledgerMapId
     * @param metadataMap
     * @param operatorsMapId
     * @param paused
     * @param tokenMetadataMapId
     */
    interface HicStorage {
        administrator: string;
        allTokens: number;
        ledgerMapId: number;
        metadataMapId: number;
        operatorsMapId: number;
        paused: boolean;
        tokenMetadataMapId: number;
    }

    export const objktsAddress = 'KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton';
    export const hDaoAddress = 'KT1AFA2mwNUMNd4SsujE1YYp29vd8BZejyKW';

    /*
     * Objkts FA2 contract storage type
     */
    export type ObjktsStorage = HicStorage;

    /*
     * Get an instance of a Objkts contract's storage by querying a given address
     * @param server The Tezos node to communicate with
     * @param address The deployed Timelock contract address
     */
    export async function getObjktsStorage(server: string): Promise<ObjktsStorage> {
        const storageResult = await TezosNodeReader.getContractStorage(server, objktsAddress);
        return {
            administrator: JSONPath({path: '$.args[0].args[0].string', json: storageResult })[0],
            allTokens: Number(JSONPath({ path: '$.args[0].args[1].int', json: storageResult })[0]),
            ledgerMapId: Number(JSONPath({ path: '$.args[0].args[2].int', json: storageResult })[0]),
            metadataMapId: Number(JSONPath({ path: '$.args[1].args[0].int', json: storageResult })[0]),
            operatorsMapId: Number(JSONPath({ path: '$.args[1].args[1].int', json: storageResult })[0]),
            paused: (JSONPath({ path: '$.args[2].prim', json: storageResult })[0]).toString().toLowerCase().startsWith('t'),
            tokenMetadataMapId: Number(JSONPath({ path: '$.args[3].int', json: storageResult })[0])
        };
    }

    /*
     * hDao FA2 contract storage type
     */
    export type HDaoStorage = HicStorage;


    /*
     * Get an instance of an hDao contract's storage by querying a given address
     * @param server The Tezos node to communicate with
     * @param address The deployed Timelock contract address
     */
    export async function getHDaoStorage(server: string): Promise<HDaoStorage> {
        const storageResult = await TezosNodeReader.getContractStorage(server, hDaoAddress);
        return {
            administrator: JSONPath({path: '$.args[0].args[0].string', json: storageResult })[0],
            allTokens: Number(JSONPath({ path: '$.args[0].args[1].int', json: storageResult })[0]),
            ledgerMapId: Number(JSONPath({ path: '$.args[0].args[2].int', json: storageResult })[0]),
            metadataMapId: Number(JSONPath({ path: '$.args[1].args[0].int', json: storageResult })[0]),
            operatorsMapId: Number(JSONPath({ path: '$.args[1].args[1].int', json: storageResult })[0]),
            paused: (JSONPath({ path: '$.args[2].prim', json: storageResult })[0]).toString().toLowerCase().startsWith('t'),
            tokenMetadataMapId: Number(JSONPath({ path: '$.args[3].int', json: storageResult })[0])
        };
    }

    /*
     * FA2 individual token transfer
     */
    interface TokenTransaction {
        destination: string;
        token_id: number;
        amount: number;
    }

    /*
     * Returns a TokenTransaction in Michelson format
     */
    export function TokenTransactionMichelson(tx: TokenTransaction): string {
        return `Pair "${tx.destination}" (Pair ${tx.token_id} ${tx.amount})`;
    }

    /*
     * FA2 batch transfer invocation parameters
     */
    interface TransferPair {
        source: string;
        txs: TokenTransaction[]
    }

    /*
     * Returns a TransferPair in Michelson format
     */
    export function TransferPairMichelson(transfers: TransferPair[]): string {
        const transferList: string = transfers.map(
            (transfer) => {
                const txList: string = transfer.txs.map((tx) => TokenTransactionMichelson(tx)).join("; ");
                return `Pair "${transfer.source}" { ${txList} }`;
            }
        ).join("; ");
        return `{ ${transferList} }`
    }

    /*
     * hDao transaction parameters
     */
    export type HDaoTransaction = TokenTransaction;

    /*
     * hDao transfer entrypoint parameters
     */
    export type HDaoTransferPair = TransferPair;

    /*
     * Helper function for single (i.e. non-batched) hDao FA2 transfer
     *
     * @param src
     * @param dest
     * @param amount
     */
    export function MakeSingleHDaoTransfer(src: string, dest: string, amount: number): HDaoTransferPair {
        return {
            source: src,
            txs: [ { destination: dest, token_id: 0, amount: amount } ]
        }
    }

    /*
     * Invokes the Transfer entrypoint of the hDao FA2 contract.
     *
     * @param server
     * @param signer
     * @param keystore
     * @param address
     * @param parameter
     * @param amount
     * @param fee
     * @param gas
     * @param freight
     */
    export async function HDaoTransfer(server: string, signer: Signer, keystore: KeyStore, transfers: HDaoTransferPair[], amount: number, fee: number, gas: number, freight: number): Promise<string> {
        const entrypoint = `transfer`;

        let parameter: string = TransferPairMichelson(transfers);
        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(
            server,
            signer,
            keystore,
            hDaoAddress, // 'KT1AFA2mwNUMNd4SsujE1YYp29vd8BZejyKW'
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
     * Objkts transaction parameters
     */
    export type ObjktsTransaction = TokenTransaction;

    /*
     * Objkts transfer entrypoint parameters
     */
    export type ObjktsTransferPair = TransferPair;

    /*
     * Helper function for single (i.e. non-batched) objkts FA2 transfer
     *
     * @param src
     * @param dest
     * @param amount
     */
    export function MakeSingleObjktsTransfer(src: string, dest: string, token_id: number, amount: number): ObjktsTransferPair {
        return {
            source: src,
            txs: [ { destination: dest, token_id: token_id, amount: amount } ]
        }
    }

    /*
     * Invokes the Transfer entrypoint of the hDao FA2 contract.
     *
     * @param server
     * @param signer
     * @param keystore
     * @param address
     * @param parameter
     * @param amount
     * @param fee
     * @param gas
     * @param freight
     */
    export async function ObjktsTransfer(server: string, signer: Signer, keystore: KeyStore, transfers: HDaoTransferPair[], amount: number, fee: number, gas: number, freight: number): Promise<string> {
        const entrypoint = `transfer`;

        let parameter: string = TransferPairMichelson(transfers);
        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(
            server,
            signer,
            keystore,
            objktsAddress, // 'KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton'
            amount,
            fee,
            freight,
            gas,
            entrypoint,
            parameter,
            TezosParameterFormat.Michelson);
        return TezosContractUtils.clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }
}

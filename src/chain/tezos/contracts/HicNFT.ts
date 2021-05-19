import {JSONPath} from 'jsonpath-plus';
import {KeyStore, Signer} from '../../../types/ExternalInterfaces';
import {TezosNodeReader} from '../TezosNodeReader';
import {TezosNodeWriter} from '../TezosNodeWriter';
import {ConseilOperator, ConseilSortDirection, ConseilServerInfo} from '../../../types/conseil/QueryTypes';
import {ConseilQueryBuilder} from '../../../reporting/ConseilQueryBuilder';
import {TezosConseilClient} from '../../../reporting/tezos/TezosConseilClient';
import {MultiAssetTokenHelper} from './tzip12/MultiAssetTokenHelper';
import {SingleAssetTokenHelper} from './tzip12/SingleAssetTokenHelper';

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
        const objktsAddress = 'KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton';
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
        const hDaoAddress = 'KT1AFA2mwNUMNd4SsujE1YYp29vd8BZejyKW';
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
     * hDao transfer entrypoint parameters
     */
    export type hDaoTransferPair = MultiAssetTokenHelper.TransferPair;

    /*
     * TODO: documentation
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
    export async function HDaoTransfer(server: string, signer: Signer, keystore: KeyStore, address: string, parameter: hDaoTransferPair, amount: number, fee: number, gas: number, freight: number): Promise<string> {
        // TODO: implementation
        // const entrypoint = `submit`;

        // // get chainId of mainnet if not specified
        // if (!submit.executionRequest.chainId) {
        //     const chainId: string = await TezosNodeReader.getChainId(server);
        //     submit.executionRequest.chainId = ``; 
        // }

        // // get current operationId if not specified
        // if (!submit.executionRequest.operationId) {
        //     const storage = await getStorage(server, address);
        //     submit.executionRequest.operationId = storage.operationId;
        // }

        // let parameter: string = SubmitPairMichelson(submit);
        // const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(
        //     server,
        //     signer,
        //     keystore,
        //     address,
        //     amount,
        //     fee,
        //     freight,
        //     gas,
        //     entrypoint,
        //     parameter,
        //     TezosParameterFormat.Michelson);
        // return TezosContractUtils.clearRPCOperationGroupHash(nodeResult.operationGroupID);
        return '';
    }

    /*
     * TODO: documentation
     */
    export type objktsTransferPair = MultiAssetTokenHelper.TransferPair;


    /*
     * TODO: documentation
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
    export async function ObjktsTransfer(server: string, signer: Signer, keystore: KeyStore, address: string, parameter: objktsTransferPair, amount: number, fee: number, gas: number, freight: number): Promise<string> {
        // TODO: implementation
        // const entrypoint = `submit`;

        // // get chainId of mainnet if not specified
        // if (!submit.executionRequest.chainId) {
        //     const chainId: string = await TezosNodeReader.getChainId(server);
        //     submit.executionRequest.chainId = ``;
        // }

        // // get current operationId if not specified
        // if (!submit.executionRequest.operationId) {
        //     const storage = await getStorage(server, address);
        //     submit.executionRequest.operationId = storage.operationId;
        // }

        // let parameter: string = SubmitPairMichelson(submit);
        // const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(
        //     server,
        //     signer,
        //     keystore,
        //     address,
        //     amount,
        //     fee,
        //     freight,
        //     gas,
        //     entrypoint,
        //     parameter,
        //     TezosParameterFormat.Michelson);
        // return TezosContractUtils.clearRPCOperationGroupHash(nodeResult.operationGroupID);
        return '';
    }
}

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
     * Objkts FA2 contract storage type
     */
    export type ObjktsStorage = MultiAssetTokenHelper.MultiAssetSimpleStorage;

    /*
     * Get an instance of a Objkts contract's storage by querying a given address
     * @param server The Tezos node to communicate with
     * @param address The deployed Timelock contract address
     */
    export async function getObjktsStorage(server: string): Promise<ObjktsStorage> {
        const objktsAddress = 'KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton';
        return await MultiAssetTokenHelper.getSimpleStorage(server, objktsAddress);
    }

    /*
     * hDao FA2 contract storage type
     */
    export type HDaoStorage = MultiAssetTokenHelper.MultiAssetSimpleStorage;


    /*
     * Get an instance of an hDao contract's storage by querying a given address
     * @param server The Tezos node to communicate with
     * @param address The deployed Timelock contract address
     */
    export async function getHDaoStorage(server: string): Promise<HDaoStorage> {
        const hDaoAddress = 'KT1AFA2mwNUMNd4SsujE1YYp29vd8BZejyKW';
        return await MultiAssetTokenHelper.getSimpleStorage(server, hDaoAddress);
    }

    /*
     * hDao transfer entrypoint parameters
     */
    export type hDaoTransferPair = MultiAssetTokenHelper.TransferPair;

    /*
     * Returns a hDaoTransferPair in Micheline format
     *
     * @param sendHDao
     */
    export function hDaoTransferMicheline(sendHDao: hDaoTransferPair): string {
        // TODO: parse parameter micheline
        return ``;
    }


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
    }

    /*
     * TODO: documentation
     */
    export type objktsTransferPair = MultiAssetTokenHelper.TransferPair;

    /*
     * Returns a SendHDaoPair in Micheline format
     *
     * @param sendHDao
     */
    export function ObjktsTransferMicheline(objktsTransfer: objktsTransferPair): string {
        // TODO: parse parameter micheline
        return ``;
    }


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
    }

    /**
     *
     *
     * @param tokenAddress The address to query transactions for.
     * @param managerAddress 
     */
    export async function getTokenTransactions(conseilServer: ConseilServerInfo, tokenAddress: string, managerAddress: string) {
        let direct = ConseilQueryBuilder.blankQuery();
        direct = ConseilQueryBuilder.addFields(
            direct,
            'timestamp',
            'block_level',
            'source',
            'destination',
            'amount',
            'kind',
            'fee',
            'status',
            'operation_group_hash',
            'parameters',
            'parameters_micheline',
            'parameters_entrypoints'
        );
        direct = ConseilQueryBuilder.addPredicate(direct, 'kind', ConseilOperator.EQ, ['transaction'], false);
        direct = ConseilQueryBuilder.addPredicate(direct, 'status', ConseilOperator.EQ, ['applied'], false);
        direct = ConseilQueryBuilder.addPredicate(direct, 'destination', ConseilOperator.EQ, [tokenAddress], false);
        direct = ConseilQueryBuilder.addPredicate(direct, 'source', ConseilOperator.EQ, [managerAddress], false);
        direct = ConseilQueryBuilder.addOrdering(direct, 'timestamp', ConseilSortDirection.DESC);
        direct = ConseilQueryBuilder.setLimit(direct, 5_000);

        let indirect = ConseilQueryBuilder.blankQuery();
        indirect = ConseilQueryBuilder.addFields(
            indirect,
            'timestamp',
            'block_level',
            'source',
            'destination',
            'amount',
            'kind',
            'fee',
            'status',
            'operation_group_hash',
            'parameters',
            'parameters_micheline',
            'parameters_entrypoints'
        );
        indirect = ConseilQueryBuilder.addPredicate(indirect, 'kind', ConseilOperator.EQ, ['transaction'], false);
        indirect = ConseilQueryBuilder.addPredicate(indirect, 'status', ConseilOperator.EQ, ['applied'], false);
        indirect = ConseilQueryBuilder.addPredicate(indirect, 'destination', ConseilOperator.EQ, [tokenAddress], false);
        indirect = ConseilQueryBuilder.addPredicate(indirect, 'parameters', ConseilOperator.LIKE, [managerAddress], false);
        indirect = ConseilQueryBuilder.addOrdering(indirect, 'timestamp', ConseilSortDirection.DESC);
        indirect = ConseilQueryBuilder.setLimit(indirect, 5_000);

        return Promise.all([direct, indirect].map((q) => TezosConseilClient.getOperations(conseilServer, conseilServer.network, q)))
            .then((responses) =>
                responses.reduce((result, r) => {
                    r.forEach((rr) => result.push(rr));
                    return result;
                })
            )
            .then((transactions) => {
                return transactions.sort((a, b) => a.timestamp - b.timestamp);
                /**
                 *
                 *
                 * @param tokenAddress The address to query transactions for.
                 * @param managerAddress 
                 */
                export async function getTokenTransactions(conseilServer: ConseilServerInfo, tokenAddress: string, managerAddress: string) {
                    let direct = ConseilQueryBuilder.blankQuery();
                    direct = ConseilQueryBuilder.addFields(
                        direct,
                        'timestamp',
                        'block_level',
                        'source',
                        'destination',
                        'amount',
                        'kind',
                        'fee',
                        'status',
                        'operation_group_hash',
                        'parameters',
                        'parameters_micheline',
                        'parameters_entrypoints'
                    );
                    direct = ConseilQueryBuilder.addPredicate(direct, 'kind', ConseilOperator.EQ, ['transaction'], false);
                    direct = ConseilQueryBuilder.addPredicate(direct, 'status', ConseilOperator.EQ, ['applied'], false);
                    direct = ConseilQueryBuilder.addPredicate(direct, 'destination', ConseilOperator.EQ, [tokenAddress], false);
                    direct = ConseilQueryBuilder.addPredicate(direct, 'source', ConseilOperator.EQ, [managerAddress], false);
                    direct = ConseilQueryBuilder.addOrdering(direct, 'timestamp', ConseilSortDirection.DESC);
                    direct = ConseilQueryBuilder.setLimit(direct, 5_000);

                    let indirect = ConseilQueryBuilder.blankQuery();
                    indirect = ConseilQueryBuilder.addFields(
                        indirect,
                        'timestamp',
                        'block_level',
                        'source',
                        'destination',
                        'amount',
                        'kind',
                        'fee',
                        'status',
                        'operation_group_hash',
                        'parameters',
                        'parameters_micheline',
                        'parameters_entrypoints'
                    );
                    indirect = ConseilQueryBuilder.addPredicate(indirect, 'kind', ConseilOperator.EQ, ['transaction'], false);
                    indirect = ConseilQueryBuilder.addPredicate(indirect, 'status', ConseilOperator.EQ, ['applied'], false);
                    indirect = ConseilQueryBuilder.addPredicate(indirect, 'destination', ConseilOperator.EQ, [tokenAddress], false);
                    indirect = ConseilQueryBuilder.addPredicate(indirect, 'parameters', ConseilOperator.LIKE, [managerAddress], false);
                    indirect = ConseilQueryBuilder.addOrdering(indirect, 'timestamp', ConseilSortDirection.DESC);
                    indirect = ConseilQueryBuilder.setLimit(indirect, 5_000);

                    return Promise.all([direct, indirect].map((q) => TezosConseilClient.getOperations(conseilServer, conseilServer.network, q)))
                        .then((responses) =>
                            responses.reduce((result, r) => {
                                r.forEach((rr) => result.push(rr));
                                return result;
                            })
                        )
                        .then((transactions) => {
                            return transactions.sort((a, b) => a.timestamp - b.timestamp);
                        });
                }

                /**
                 * Queries the last price listed on chain.
                 *
                 * @param operations
                 */
                function makeLastPriceQuery(operations) {

                }

                /**
                 *
                 *
                 * @param
                 */
                export async function getCollection(tokenMapId: number, managerAddress: string, node: Node): Promise<any[]> {
                }

                /**
                 *
                 *
                 * @param
                 */
                export async function getCollectionSize(tokenMapId: number, managerAddress: string, node: Node): Promise<number> {
                }

                /**
                 * Returns raw hDAO token balance for the account.
                 * KT1AFA2mwNUMNd4SsujE1YYp29vd8BZejyKW, ledger map id 515
                 *
                 * @param tokenMapId
                 * @param managerAddress
                 * @param node
                 * @returns
                 */
                export async function getBalance(tezosUrl: string, mapId: number, address: string): Promise<number> {
                }


                // TODO: token datastructure

                /**
                 *
                 *
                 * @param
                 */
                export async function getTokenInfo(node: Node, mapId: number = 515): Promise<{holders: number; totalBalance: number}> {
                }

                /**
                 *
                 *
                 * @param
                 */
                export async function getNFTObjectDetails(tezosUrl: string, objectId: number) {

                }

                /**
                 *
                 *
                 * @param
                 */
                function chunkArray(arr: any[], len: number) {
                    const chunks: any[] = [];
                    const n = arr.length;

                    let i = 0;
                    while (i < n) {
                        chunks.push(arr.slice(i, (i += len)));
                    }

                    return chunks;
                }
            }

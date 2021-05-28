import {JSONPath} from 'jsonpath-plus';
import {BigNumber} from 'bignumber.js';
import {KeyStore, Signer} from '../../../types/ExternalInterfaces';
import {TezosNodeReader} from '../TezosNodeReader';
import {TezosNodeWriter} from '../TezosNodeWriter';
import {ConseilOperator, ConseilSortDirection, ConseilServerInfo} from '../../../types/conseil/QueryTypes';
import {ConseilQueryBuilder} from '../../../reporting/ConseilQueryBuilder';
import {TezosConseilClient} from '../../../reporting/tezos/TezosConseilClient';
import {MultiAssetTokenHelper, MultiAssetSimpleStorage, TransferPair} from './tzip12/MultiAssetTokenHelper';
import {TezosParameterFormat} from '../../../types/tezos/TezosChainTypes';
import {TezosContractUtils} from './TezosContractUtils';
import {TezosMessageUtils} from '../TezosMessageUtil';

export namespace HicNFTHelper {
    export const objktsAddress = 'KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton';
    export const hDaoAddress = 'KT1AFA2mwNUMNd4SsujE1YYp29vd8BZejyKW';

    /*
     * Get an instance of a Objkts contract's storage by querying a given address
     * @param server The Tezos node to communicate with
     * @param address Contract address, i.e. HicNFTHelper.objktsAddress or HicNFTHelper.hDaoAddress
     */
    export async function getStorage(server: string, address: string): Promise<MultiAssetSimpleStorage> {
        const storageResult = await TezosNodeReader.getContractStorage(server, address);
        return {
            administrator: JSONPath({path: '$.args[0].args[0].string', json: storageResult })[0],
            tokens: Number(JSONPath({ path: '$.args[0].args[1].int', json: storageResult })[0]),
            ledger: Number(JSONPath({ path: '$.args[0].args[2].int', json: storageResult })[0]),
            metadata: Number(JSONPath({ path: '$.args[1].args[0].int', json: storageResult })[0]),
            operators: Number(JSONPath({ path: '$.args[1].args[1].int', json: storageResult })[0]),
            paused: (JSONPath({ path: '$.args[2].prim', json: storageResult })[0]).toString().toLowerCase().startsWith('t'),
            tokenMetadata: Number(JSONPath({ path: '$.args[3].int', json: storageResult })[0])
        };
    }

    /*
     * Returns a query for the last price.
     *
     * @param operations Array of chunks of operations (see `chunkArray()`)
     */
    function makeLastPriceQuery(operations) {
        let lastPriceQuery = ConseilQueryBuilder.blankQuery();
        lastPriceQuery = ConseilQueryBuilder.addFields(lastPriceQuery, 'timestamp', 'amount', 'operation_group_hash', 'parameters_entrypoints', 'parameters');
        lastPriceQuery = ConseilQueryBuilder.addPredicate(lastPriceQuery, 'kind', ConseilOperator.EQ, ['transaction']);
        lastPriceQuery = ConseilQueryBuilder.addPredicate(lastPriceQuery, 'status', ConseilOperator.EQ, ['applied']);
        lastPriceQuery = ConseilQueryBuilder.addPredicate(lastPriceQuery, 'internal', ConseilOperator.EQ, ['false']);
        lastPriceQuery = ConseilQueryBuilder.addPredicate(
            lastPriceQuery,
            'operation_group_hash',
            operations.length > 1 ? ConseilOperator.IN : ConseilOperator.EQ,
            operations
        );
        lastPriceQuery = ConseilQueryBuilder.setLimit(lastPriceQuery, operations.length);

        return lastPriceQuery;
    }

    /*
     * Retreives the collection of tokens owned by managerAddress.
     *
     * @param tokenMapId
     * @param managerAddress
     * @param serverInfo
     */
    export async function getCollection(tokenMapId: number, managerAddress: string, serverInfo: ConseilServerInfo): Promise<any[]> {
        let collectionQuery = ConseilQueryBuilder.blankQuery();
        // TODO: add comment with the query
        collectionQuery = ConseilQueryBuilder.addFields(collectionQuery, 'key', 'value', 'operation_group_id');
        collectionQuery = ConseilQueryBuilder.addPredicate(collectionQuery, 'big_map_id', ConseilOperator.EQ, [tokenMapId]);
        collectionQuery = ConseilQueryBuilder.addPredicate(collectionQuery, 'key', ConseilOperator.STARTSWITH, [
            `Pair 0x${TezosMessageUtils.writeAddress(managerAddress)}`,
        ]);
        collectionQuery = ConseilQueryBuilder.addPredicate(collectionQuery, 'value', ConseilOperator.EQ, [0], true);
        collectionQuery = ConseilQueryBuilder.setLimit(collectionQuery, 10_000);

        const collectionResult = await TezosConseilClient.getTezosEntityData(serverInfo, serverInfo.network, 'big_map_contents', collectionQuery);

        const operationGroupIds = collectionResult.map((r) => r.operation_group_id);
        const queryChunks = chunkArray(operationGroupIds, 30);
        const priceQueries = queryChunks.map((c) => makeLastPriceQuery(c));

        const priceMap: any = {};
        await Promise.all(
            priceQueries.map(
                async (q) =>
                    await TezosConseilClient.getTezosEntityData(serverInfo, serverInfo.network, 'operations', q).then((result) =>
                        result.map((row) => {
                            let amount = 0;
                            const action = row.parameters_entrypoints;

                            if (action === 'collect') {
                                amount = Number(row.parameters.toString().replace(/^Pair ([0-9]+) [0-9]+/, '$1'));
                            } else if (action === 'transfer') {
                                amount = Number(
                                    row.parameters
                                        .toString()
                                        .replace(
                                            /[{] Pair \"[1-9A-HJ-NP-Za-km-z]{36}\" [{] Pair \"[1-9A-HJ-NP-Za-km-z]{36}\" [(]Pair [0-9]+ [0-9]+[)] [}] [}]/,
                                            '$1'
                                        )
                                );
                            }

                            priceMap[row.operation_group_hash] = {
                                price: new BigNumber(row.amount),
                                amount,
                                timestamp: row.timestamp,
                                action,
                            };
                        })
                    )
            )
        );

        const collection = collectionResult.map((row) => {
            let price = 0;
            let receivedOn = new Date();
            let action = '';

            try {
                const priceRecord = priceMap[row.operation_group_id];
                price = priceRecord.price.dividedToIntegerBy(priceRecord.amount).toNumber();
                receivedOn = new Date(priceRecord.timestamp);
                action = priceRecord.action === 'collect' ? 'Purchased' : 'Received';
            } catch {
                //
            }

            return {
                piece: row.key.toString().replace(/.* ([0-9]{1,}$)/, '$1'),
                amount: Number(row.value),
                price: isNaN(price) ? 0 : price,
                receivedOn,
                action,
            };
        });

        return collection.sort((a, b) => b.receivedOn.getTime() - a.receivedOn.getTime());
    }

    /*
     * Fetch an account's collection and return its size.
     *
     * @param
     */
    export async function getCollectionSize(tokenMapId: number, managerAddress: string, serverInfo: ConseilServerInfo): Promise<number> {
        const collection = await getCollection(tokenMapId, managerAddress, serverInfo);
        const tokenCount = collection.reduce((a, c) => a + c.amount, 0);

        return tokenCount;
    }

    /**
     * Returns raw hDAO token balance for the account.
     * KT1AFA2mwNUMNd4SsujE1YYp29vd8BZejyKW, ledger map id 515
     *
     * @param server
     * @param mapId
     * @param address
     */
    export async function getBalance(server: string, mapId: number, address: string): Promise<number> {
        const packedTokenKey = TezosMessageUtils.encodeBigMapKey(
            Buffer.from(TezosMessageUtils.writePackedData(`(Pair 0x${TezosMessageUtils.writeAddress(address)} 0)`, '', TezosParameterFormat.Michelson), 'hex')
        );
        let balance = 0;

        try {
            const balanceResult = await TezosNodeReader.getValueForBigMapKey(server, mapId, packedTokenKey);
            balance = new BigNumber(JSONPath({ path: '$.int', json: balanceResult })[0]).toNumber();
        } catch (err) {
            //
        }

        return balance;
    }

    /*
     * Return the number of holders and total balance held of hDao tokens.
     *
     * @param
     */
    export async function getTokenInfo(serverInfo: ConseilServerInfo, mapId: number = 515): Promise<{ holders: number; totalBalance: number }> {
        let holdersQuery = ConseilQueryBuilder.blankQuery();
        holdersQuery = ConseilQueryBuilder.addFields(holdersQuery, 'value');
        holdersQuery = ConseilQueryBuilder.addPredicate(holdersQuery, 'big_map_id', ConseilOperator.EQ, [mapId]);
        holdersQuery = ConseilQueryBuilder.setLimit(holdersQuery, 20_000);

        const holdersResult = await TezosConseilClient.getTezosEntityData(serverInfo, serverInfo.network, 'big_map_contents', holdersQuery);

        let holders = 0;
        let totalBalance = new BigNumber(0);
        holdersResult.forEach((r) => {
            try {
                const balance = new BigNumber(r.value);
                if (balance.isGreaterThan(0)) {
                    totalBalance = totalBalance.plus(balance);
                }
                holders++;
            } catch {
                // eh
            }
        });

        return { holders, totalBalance: totalBalance.toNumber() };
    }

    /*
     * Retrieves an NFT object's metadata.
     *
     * @param server The Teznos node to query
     * @param objectId The token_id of the NFT to query
     */
    export async function getNFTObjectDetails(server: string, objectId: number) {
        const packedNftId = TezosMessageUtils.encodeBigMapKey(Buffer.from(TezosMessageUtils.writePackedData(objectId, 'int'), 'hex'));
        const nftInfo = await TezosNodeReader.getValueForBigMapKey(server, 514, packedNftId);
        const ipfsUrlBytes = JSONPath({ path: '$.args[1][0].args[1].bytes', json: nftInfo })[0];
        const ipfsHash = Buffer.from(ipfsUrlBytes, 'hex').toString().slice(7);

        const nftDetails = await fetch(`https://cloudflare-ipfs.com/ipfs/${ipfsHash}`, { cache: 'no-store' });
        const nftDetailJson = await nftDetails.json();

        const nftName = nftDetailJson.name;
        const nftDescription = nftDetailJson.description;
        const nftCreators = nftDetailJson.creators
            .map((c) => c.trim())
            .map((c) => `${c.slice(0, 6)}...${c.slice(c.length - 6, c.length)}`)
            .join(', '); // TODO: use names where possible
        const nftArtifact = `https://cloudflare-ipfs.com/ipfs/${nftDetailJson.formats[0].uri.toString().slice(7)}`;
        const nftArtifactType = nftDetailJson.formats[0].mimeType.toString();

        return { name: nftName, description: nftDescription, creators: nftCreators, artifactUrl: nftArtifact, artifactType: nftArtifactType };
    }

    /*
     * Turn an array of n=k*len elements into an array of k arrays of length len.
     *
     * @param arr
     * @param len
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

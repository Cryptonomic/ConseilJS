import {KeyStore, Signer} from "../../../types/ExternalInterfaces";
import {TezosNodeReader} from "../TezosNodeReader";
import {TezosNodeWriter} from "../TezosNodeWriter";
import * as TezosTypes from "../../../types/tezos/TezosChainTypes";
import {TezosContractUtils} from './TezosContractUtils';
import {ConseilQueryBuilder} from "../../../reporting/ConseilQueryBuilder";
import {TezosMessageUtils} from "../TezosMessageUtil";
import {ConseilOperator, ConseilServerInfo, ConseilQuery} from "../../../types/conseil/QueryTypes";
import {TezosConseilClient} from "../../../reporting/tezos/TezosConseilClient";
import {JSONPath} from "jsonpath-plus";
import BigNumber from "bignumber.js";

export namespace KalamintHelper {
    export const kalamintAddress: string = "KT1EpGgjQs73QfFJs9z7m1Mxm5MTnpC2tqse";
    export const kalamintLedgerMapId: number = 857;
    export const kalamintTokenMapId: number = 861;

    export type Auctions = { [ id: number]: string };

    export interface KalamintStorage {
        administrator: string;
        allCollections: number;
        allTokens: number;
        auctionsFactory: string;
        auctions: Auctions;
        biddingFee: number;
        collections: number;
        idMaxIncrement: number;
        ipfsRegistry: string;
        ledger: number;
        maxEditions: number;
        maxRoyalty: number;
        metadata: number;
        operators: number;
        paused: boolean;
        tokenMetadata: number;
        tokens: number;
        tradingFee: number;
        tradingFeeCollector: string;
        x: number;
    }

    /*
     * Get an instance of the Kalamint contract's storage.
     *
     * @param server The Tezos node to communicate with
     * @param address Contract address, i.e. KalamintHelper.kalamintAddress
     */
    export async function getStorage(server: string, address: string): Promise<KalamintStorage> {
        const storageResult = await TezosNodeReader.getContractStorage(server, address);
        const auctionsArray = JSONPath({path: '$.args[0].args[0].args[3]', json: storageResult })[0];
        let auctions: Auctions = {};
        for (const elt of auctionsArray) {
            auctions[elt.args[0].int] = elt.args[1].string;
        }

        return {
            administrator: JSONPath({path: '$.args[0].args[0].args[0].args[0].string', json: storageResult })[0],
            allCollections: JSONPath({path: '$.args[0].args[0].args[0].args[1].int', json: storageResult })[0],
            allTokens: JSONPath({path: '$.args[0].args[0].args[1].int', json: storageResult })[0],
            auctionsFactory: JSONPath({path: '$.args[0].args[0].args[2].string', json: storageResult })[0],
            auctions: auctions,
            biddingFee: JSONPath({path: '$.args[0].args[1].args[0].int', json: storageResult })[0],
            collections: JSONPath({path: '$.args[0].args[1].args[1].int', json: storageResult })[0],
            idMaxIncrement: JSONPath({path: '$.args[0].args[2].int', json: storageResult })[0],
            ipfsRegistry: JSONPath({path: '$.args[0].args[3].string', json: storageResult })[0],
            ledger: JSONPath({path: '$.args[0].args[4].int', json: storageResult })[0],
            maxEditions: JSONPath({path: '$.args[1].args[0].args[0].int', json: storageResult })[0],
            maxRoyalty: JSONPath({path: '$.args[1].args[0].args[1].int', json: storageResult })[0],
            metadata: JSONPath({path: '$.args[1].args[1].int', json: storageResult })[0],
            operators: JSONPath({path: '$.args[1].args[3].int', json: storageResult })[0],
            paused: JSON.parse(JSONPath({path: '$.args[2].args[0].prim', json: storageResult })[0].toLowerCase()),
            tokenMetadata: JSONPath({path: '$.args[2].args[1].int', json: storageResult })[0],
            tokens: JSONPath({path: '$.args[2].args[2].int', json: storageResult })[0],
            tradingFee: JSONPath({path: '$.args[3].int', json: storageResult })[0],
            tradingFeeCollector: JSONPath({path: '$.args[4].int', json: storageResult })[0],
            x: JSONPath({path: '$.args[5].int', json: storageResult })[0]
        };
    }

    export interface BidPair {
        tokenId: number;
        amount: number;
    }

    /*
     * Submit bid to the Kalamint contract
     *
     * @param bid Invocation parameters
     */
    export async function bid(server: string, address: string, signer: Signer, keystore: KeyStore,  bid: BidPair ,fee: number, gas: number = 800_000, freight: number = 20_000): Promise<string> {
        const entryPoint = 'bid';
        const parameters = `${bid.tokenId}`;
        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(server, signer, keystore, address, bid.amount, fee, freight, gas, entryPoint, parameters, TezosTypes.TezosParameterFormat.Michelson);
        return TezosContractUtils.clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }

    export interface BuyPair {
        tokenId: number;
        amount: number;
    }

    /*
     * Buy NFT from the Kalamint contract
     *
     * @param buy Invocation parameters
     */
    export async function buy(server: string, address: string, signer: Signer, keystore: KeyStore, buy: BuyPair, fee: number,  gas: number = 800_000, freight: number = 20_000): Promise<string> {
        const entryPoint = 'buy';
        const parameters = `{
            "int": ${buy.tokenId}
        }`;
        const nodeResult = await TezosNodeWriter.sendContractInvocationOperation(server, signer, keystore, address, buy.amount, fee, freight, gas, entryPoint, parameters, TezosTypes.TezosParameterFormat.Micheline);
        return TezosContractUtils.clearRPCOperationGroupHash(nodeResult.operationGroupID);
    }

    /*
     * Collection metadata
     *
     * @param
     */
    export interface CollectionInfo {
        collectionName: string;
        creatorName: string;
        editionNumber: number;
        editions: number;
    }

    /*
     * Representation of a Kalamint artwork
     *
     * @param tokenId The FA2 token Id of the artwork
     * @param name Artwork's name
     * @param action The action with which the artwork was obtained (e.g. Buy, Bid, Transfer)
     * @param cost The price for which the artwork was purchased
     * @param collection The metadata for the collection to which the artwork belongs
     * @param currentPrice The price for which it is currently on sale for
     * @param onSale Indicator for if the artwork is currently on sale
     * @param onAuction Indicator for if an auction is currently active for the artwork
     * @param artifactIpfsCid IPFS CID for the artwork artifact
     */
    export interface Artwork {
        tokenId: number;
        name: string;
        action: string;
        cost: BigNumber;
        collection: CollectionInfo;
        receivedOn: Date;
        currentPrice: BigNumber;
        onSale: boolean;
        onAuction: boolean;
        artifactIpfsCid: string;
    }

    /*
     * Retreives the collection of tokens owned by managerAddress.
     *
     * @param ledger
     * @param tokenMapId
     * @param address
     * @param serverInfo
     */
    export async function getArtworks(ledger: number, tokenMapId: number, address: string, serverInfo: ConseilServerInfo): Promise<Artwork[]> {
        // get all assets of address from the ledger
        const operationsQuery = makeOperationsQuery(address, ledger);
        const operationsResult = await TezosConseilClient.getTezosEntityData(serverInfo, serverInfo.network, 'big_map_contents', operationsQuery);
        const operationGroupIds = operationsResult.map((r) => r.operation_group_id);
        const operationChunks = chunkArray(operationGroupIds, 30);

        // save each tokenId's invocation
        const invocations = {};
        operationsResult.map((row) => invocations[row.key.replace(/.* ([0-9]{1,})/, '$1')] = row.operation_group_id);
        const invocationChunks = chunkArray(Object.entries(invocations).map(([id, operation]) => id), 30);

        // fetch and save each invocation's metadata
        const invocationMetadataQueries = operationChunks.map((c) => makeInvocationMetadataQuery(c));
        const invocationMetadata = {};
        // winning bids need to be queried for internal operations
        const endAuctionOperations: string[] = [];
        await Promise.all(
            invocationMetadataQueries.map(async (q) => {
                const invocationsResult = await TezosConseilClient.getTezosEntityData(serverInfo, serverInfo.network, 'operations', q);
                invocationsResult.map(async (row) => {
                    const metadata: InvocationMetadata = await parseInvocationMetadataResult(row);
                    // remember which bids need to be retrieved
                    if (metadata.price === undefined)
                        endAuctionOperations.push(row.operation_group_hash);
                    invocationMetadata[row.operation_group_hash] = metadata;
                });
        }));

        // get winning bid amounts from internal operations
        const endAuctionChunks = chunkArray(endAuctionOperations, 30);
        const endAuctionQueries = endAuctionChunks.map((c) => makeEndAuctionQuery(c));
        await Promise.all(
            endAuctionQueries.map(async (q) => {
                const endAuctionResult = await TezosConseilClient.getTezosEntityData(serverInfo, serverInfo.network, 'operations', q);
                endAuctionResult.map((row) => invocationMetadata[row.operation_group_hash].price = parseEndAuctionResult(row));
            })
        );

        // get token metadata
        const tokenMetadataQueries = invocationChunks.map((c) => makeTokenMetadataQuery(tokenMapId, c));
        const collection: Artwork[] = [];
        await Promise.all(
            tokenMetadataQueries.map(async (q) => {
                const tokenMetadataResult = await TezosConseilClient.getTezosEntityData(serverInfo, serverInfo.network, 'big_map_contents', q);
                tokenMetadataResult.map((row) => {
                    collection.push(parseTokenMetadataResult(row, invocations, invocationMetadata));
                });
        }));

        // return assets sorted chronlogically
        return collection.sort((a, b) => b.receivedOn.getTime() - a.receivedOn.getTime());
    }

    /*
     * Craft the query for operations from the ledger big map
     *
     * @param address The address for which to query data
     * @param ledger The ledger big map id
     */
    function makeOperationsQuery(address: string, ledger: number): ConseilQuery {
        let operationsQuery = ConseilQueryBuilder.blankQuery();
        operationsQuery = ConseilQueryBuilder.addFields(operationsQuery, 'key', 'value', 'operation_group_id');
        operationsQuery = ConseilQueryBuilder.addPredicate(operationsQuery, 'big_map_id', ConseilOperator.EQ, [ledger]);
        operationsQuery = ConseilQueryBuilder.addPredicate(operationsQuery, 'key', ConseilOperator.STARTSWITH, [
            `Pair 0x${TezosMessageUtils.writeAddress(address)}`,
        ]);
        operationsQuery = ConseilQueryBuilder.addPredicate(operationsQuery, 'value', ConseilOperator.EQ, [0], true);
        operationsQuery = ConseilQueryBuilder.setLimit(operationsQuery, 10_000);
        return operationsQuery;
    }

    /*
     * Returns a query for the last price.
     *
     * @param operations Array of chunks of operations (see `chunkArray()`)
     */
    function makeInvocationMetadataQuery(operations: ConseilQuery[]): ConseilQuery {
        let invocationsQuery = ConseilQueryBuilder.blankQuery();
        invocationsQuery = ConseilQueryBuilder.addFields(invocationsQuery, 'timestamp', 'amount', 'operation_group_hash', 'parameters_entrypoints', 'parameters');
        invocationsQuery = ConseilQueryBuilder.addPredicate(invocationsQuery, 'kind', ConseilOperator.EQ, ['transaction']);
        invocationsQuery = ConseilQueryBuilder.addPredicate(invocationsQuery, 'status', ConseilOperator.EQ, ['applied']);
        invocationsQuery = ConseilQueryBuilder.addPredicate(invocationsQuery, 'internal', ConseilOperator.EQ, ['false']);
        invocationsQuery = ConseilQueryBuilder.addPredicate(
            invocationsQuery,
            'operation_group_hash',
            operations.length > 1 ? ConseilOperator.IN : ConseilOperator.EQ,
            operations
        );
        invocationsQuery = ConseilQueryBuilder.setLimit(invocationsQuery, operations.length);

        return invocationsQuery;
    }

    /*
     * The parsed results of invocation metadata queries
     *
     * @param action The entrypoint invoked
     * @param price The purchase price or winning bid (0 if minted or transfered)
     * @param timestamp Invocation timestamp
     */
    interface InvocationMetadata {
        action: string;
        price: BigNumber | undefined;
        receivedOn: Date;
    }

    /*
     * Parse the results of the invocation metadata queries
     *
     * @param row
     */
    async function parseInvocationMetadataResult(row): Promise<InvocationMetadata> {
        let action =  row.parameters_entrypoints;

        // parse purchase or winning bid price
        let price: BigNumber | undefined;
        if (action === 'buy') {
            price = new BigNumber(parseInt(row.amount));
        } else if (action === 'resolve_auction') {
            // need to get winning bid operation
            price = undefined;
        } else
            price = new BigNumber(0);

        return {
            action: action,
            price: price,
            receivedOn: new Date(row.timestamp)
        };
    }

    /*
     * Craft the query for the winning bid
     *
     * @param operations Array of chunks of operations (see `chunkArray()`)
     */
    function makeEndAuctionQuery(operations: string[]): ConseilQuery {
        let endAuctionQuery = ConseilQueryBuilder.blankQuery();
        endAuctionQuery = ConseilQueryBuilder.addFields(endAuctionQuery, 'amount', 'operation_group_hash');
        endAuctionQuery = ConseilQueryBuilder.addPredicate(endAuctionQuery, 'internal', ConseilOperator.EQ, ['true'])
        endAuctionQuery = ConseilQueryBuilder.addPredicate(endAuctionQuery, 'parameters_entrypoints', ConseilOperator.EQ, ['end_auction'])
        endAuctionQuery = ConseilQueryBuilder.addPredicate(
            endAuctionQuery,
            'operation_group_hash',
            operations.length > 1 ? ConseilOperator.IN : ConseilOperator.EQ,
            operations
        );
        endAuctionQuery = ConseilQueryBuilder.setLimit(endAuctionQuery, operations.length);
        return endAuctionQuery;
    }

    /*
     * Parse the winning bid query results
     *
     * @param row
     */
    function parseEndAuctionResult(row): BigNumber {
        return new BigNumber(row.amount);
    }

    /*
     * Craft the query for the token metadata
     *
     * @param tokenMap The token bigmap id
     * @param tokenIds The array of token ids to query data for
     */
    function makeTokenMetadataQuery(tokenMap: number, tokenIds: number[]): ConseilQuery {
        let tokensQuery = ConseilQueryBuilder.blankQuery();
        tokensQuery = ConseilQueryBuilder.addFields(tokensQuery, 'key', 'value', 'operation_group_id');
        tokensQuery = ConseilQueryBuilder.addPredicate(tokensQuery, 'big_map_id', ConseilOperator.EQ, [tokenMap]);
        tokensQuery = ConseilQueryBuilder.addPredicate(
            tokensQuery,
            'key',
            tokenIds.length > 1 ? ConseilOperator.IN : ConseilOperator.EQ,
            tokenIds);
        tokensQuery = ConseilQueryBuilder.setLimit(tokensQuery, tokenIds.length);
        return tokensQuery;
    }

    /*
     * Parse the results of the token metadata queries
     *
     * @param row
     */
    function parseTokenMetadataResult(row, invocations, invocationsMetadata): Artwork {
        let tokenId = parseInt(row.key);
        let invocationOperation = invocations[tokenId];
        let invocationMetadata = invocationsMetadata[invocationOperation];
        return {
            tokenId: parseInt(row.key),
            name: row.value.toString().replace(/.* \"name\" "(.*?)" .*/, '$1'),
            collection: {
                collectionName: row.value.toString().replace(/.* "collection_name" "(.*?)" .*/, '$1'),
                creatorName: row.value.toString().replace(/.* "creator_name" "(.*?)" .*/, '$1'),
                editions: parseInt(row.value.toString().replace(/.* ([0-9]*?) }/, '$1')),
                editionNumber: parseInt(row.value.toString().replace(/.* ([0-9]*?) ; [0-9]* }/, '$1'))
            } as CollectionInfo,
            artifactIpfsCid: row.value.toString().replace(/.* \"ipfs:\\\/\\\/([a-zA-Z0-9]*?)" .*/, '$1'),
            action: invocationMetadata.action,
            receivedOn: invocationMetadata.receivedOn,
            cost: new BigNumber(invocationMetadata.price),
            currentPrice: new BigNumber(parseInt(row.value.toString().replace(/.* } ; [0-9]+ ; ([0-9]*?) .*/, '$1'))),
            onSale: row.value.toString().replace(/.* "ipfs:.*" ; .*? ; \b(False|True)\b .*/, '$1').toLowerCase().startsWith('t'),
            onAuction: row.value.toString().replace(/.* "ipfs:.*" ; .*? ; \b(False|True)\b ; \b(False|True)\b.*/, '$2').toLowerCase().startsWith('t')
        }
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


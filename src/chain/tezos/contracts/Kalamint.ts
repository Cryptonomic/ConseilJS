import {TezosNodeReader} from "../TezosNodeReader";
import {JSONPath} from "jsonpath-plus";

export namespace KalamintHelper {
    export const kalamintAddress: string = "KT1EpGgjQs73QfFJs9z7m1Mxm5MTnpC2tqse";

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
        const auctionsArray = JSONPath({path: '$.args[0].args[0].args[3]', json: storageResult })[0]; // need to parse this array
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

   // balance_of (owner: list (address), token_id: nat, owner: contract (list (address)), token_id: nat, balance: nat), L L L L
   // bid (nat), L L L R
   // buy (nat), L L R L
   // cancel_auction (nat), L L R R L
   // delist_token (nat), L L R R R
   // end_auction (highest_bidder: address, token_id: nat), L R L L
   // list_token (price: mutez, token_id: nat), L R L R L
   // mint (category: string, collection_id: nat, collection_name: string, creator_name: string, creator_royalty: nat, editions: nat, ipfs_hash: string, keywords: string, name: string, on_sale: bool, price: mutez, symbol: string, token_id: nat, token_metadata_uri: bytes), L R L R R
   // register_auction (auction_contract: address, reserve_price: mutez, token_id: nat), L R R L
   // resolve_auction (nat), L R R R L
   // set_administrator (address), L R R R R
   // set_auction_factory (address), R L L L
   // set_bidding_fee (nat), R L L R
   // set_contract_metadata_uri (bytes), R L R L
   // set_ipfs_registry (address), R L R R L
   // set_max_editions (nat), R L R R R
   // set_max_royalty (nat), R R L L
   // set_token_metadata_uri (token_id: nat, uri: bytes), R R L R L
   // set_trading_fee (nat), R R L R R
   // set_trading_fee_collector (address), R R R L
   // transfer (from_: list (address), to_: list (address), token_id: nat, amount: nat), R R R R L
   // update_operators (owner: list (address), operator: address, token_id: nat), R R R R R L
   // remove_operator (owner: address, operator: address, token_id: nat), R R R R R R 
}


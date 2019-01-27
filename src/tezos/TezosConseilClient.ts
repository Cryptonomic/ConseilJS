import {ConseilOperator, ConseilQuery, ConseilSortDirection} from "../utils/v2/ConseilQuery";
import {ConseilMetadataClient} from "../utils/v2/ConseilMetadataClient";
import {ConseilDataClient} from "../utils/v2/ConseilDataClient";
import { url } from "inspector";

/**
 * Functions for querying the Conseil backend REST API v2
 */
export class TezosConseilClient extends ConseilDataClient {
    BLOCKS = 'blocks';
    ACCOUNTS = 'accounts';
    OPERATION_GROUPS = 'operation_groups';
    OPERATIONS = 'operations';

    apiKey = '';
    server = '';

    metaDataClient: ConseilMetadataClient;

    constructor(apiKey: string, server: string){
        super();

        this.apiKey = apiKey;
        this.server = server;

        this.metaDataClient = new ConseilMetadataClient(); // TODO: load entities
    }

    /**
     * Returns a record set for a specific entity of the Tezos platform. Entity list and metadata can be retrieved using ConseilMetadataClient.
     * 
     * @param network Tezos network to query, mainnet, alphanet, etc.
     * @param entity Entity to retrieve.
     * @param filter Filter to apply.
     */
    async getTezosEntityData(network: string, entity: string, query: ConseilQuery): Promise<object> {
        return super.executeEntityQuery({ "url": this.server, "apiKey": this.apiKey }, 'tezos', network, entity, query);
    }

    /**
     * Get the head block from the Tezos platform given a network.
     * 
     * @param network Tezos network to query, mainnet, alphanet, etc.
     */
    async getBlockHead(network: string): Promise<object> {
        const query = new ConseilQuery().setOrdering('level', ConseilSortDirection.DESC).setLimit(1);

        return this.getTezosEntityData(network, this.BLOCKS, query);
    }

    async getBlock(network: string, hash: string): Promise<object> {
        const query = new ConseilQuery().addPredicate('hash', ConseilOperator.EQ, [hash], false).setLimit(1);

        return this.getTezosEntityData(network, this.BLOCKS, query);
    }

    async getAccount(network: string, accountID: string): Promise<object> {
        const query = new ConseilQuery().addPredicate('account_id', ConseilOperator.EQ, [accountID], false).setLimit(1);

        return this.getTezosEntityData(network, this.ACCOUNTS, query);
    }

    async getOperationGroup(network: string, operationGroupID: string): Promise<object> {
        const query = new ConseilQuery().addPredicate('operation_id', ConseilOperator.EQ, [operationGroupID], false).setLimit(1);

        return this.getTezosEntityData(network, this.OPERATION_GROUPS, query);
    }

    async getBlocks(network: string, query: ConseilQuery): Promise<object> {
        return this.getTezosEntityData(network, this.BLOCKS, query)
    }

    async getAccounts(network: string, query: ConseilQuery): Promise<object> {
        return this.getTezosEntityData(network, this.ACCOUNTS, query)
    }

    async getOperationGroups(network: string, query: ConseilQuery): Promise<object> {
        return this.getTezosEntityData(network, this.OPERATION_GROUPS, query)
    }

    async getOperations(network: string, query: ConseilQuery): Promise<object> {
        return this.getTezosEntityData(network, this.OPERATIONS, query)
    }
}

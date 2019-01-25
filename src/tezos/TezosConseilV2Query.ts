import {ConseilFilter, ConseilOperator, ConseilQuery, ConseilSortDirection} from "../utils/v2/ConseilQuery";
import {ConseilMetadataClient} from "../utils/v2/ConseilMetadataClient";
import {ConseilDataClient} from "../utils/v2/ConseilDataClient";

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
    platform = 'tezos';

    metaDataClient: ConseilMetadataClient;

    constructor(apiKey: string, server: string){
        super();

        this.apiKey = apiKey;
        this.server = server;

        this.metaDataClient = new ConseilMetadataClient(); // TODO: load entities
    }

    /**
     * 
     * @param network 
     * @param entity 
     * @param filter 
     */
    async getTezosEntityData(network: string, entity: string, filter: ConseilFilter): Promise<object> {
        return super.runDataQuery(this.apiKey, this.server, this.platform, network, entity, filter);
    }

    async getBlockHead(network: string): Promise<object> {
        let filter = ConseilQuery.getEmptyFilter();
        filter = ConseilQuery.setOrderingForFilter(filter, 'level', ConseilSortDirection.DESC);
        filter = ConseilQuery.setLimitForFilter(filter, 1);

        return this.getTezosEntityData(network, this.BLOCKS, filter);
    }

    async getBlock(network: string, hash: string): Promise<object> {
        let filter = ConseilQuery.getEmptyFilter();
        filter = ConseilQuery.addPredicateToFilter(filter, 'hash', ConseilOperator.EQ, [hash], false);
        filter = ConseilQuery.setLimitForFilter(filter, 1);

        return this.getTezosEntityData(network, this.BLOCKS , filter)
    }

    async getAccount(network: string, accountID: string): Promise<object> {
        let filter = ConseilQuery.getEmptyFilter();
        filter = ConseilQuery.addPredicateToFilter(filter, 'account_id', ConseilOperator.EQ, [accountID], false);
        filter = ConseilQuery.setLimitForFilter(filter, 1);

        return this.getTezosEntityData(network, this.ACCOUNTS , filter)
    }

    async getOperationGroup(network: string, operationGroupID: string): Promise<object> {
        let filter = ConseilQuery.getEmptyFilter();
        filter = ConseilQuery.addPredicateToFilter(filter, 'operation_id', ConseilOperator.EQ, [operationGroupID], false);
        filter = ConseilQuery.setLimitForFilter(filter, 1);

        return this.getTezosEntityData(network, this.OPERATION_GROUPS , filter)
    }

    async getBlocks(network: string, filter: ConseilFilter): Promise<object> {
        return this.getTezosEntityData(network, this.BLOCKS , filter)
    }

    async getAccounts(network: string, filter: ConseilFilter): Promise<object> {
        return this.getTezosEntityData(network, this.ACCOUNTS , filter)
    }

    async getOperationGroups(server: string, apiKey: string, network: string, filter: ConseilFilter): Promise<object> {
        return this.getTezosEntityData(network, this.OPERATION_GROUPS , filter)
    }

    async getOperations(server: string, apiKey: string, network: string, filter: ConseilFilter): Promise<object> {
        return this.getTezosEntityData(network, this.OPERATIONS , filter)
    }
}
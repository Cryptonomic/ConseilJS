import fetch from "node-fetch";

export enum ConseilV2SortDirection {
    ASC = "asc",
    DESC = "desc"
}

export enum ConseilV2Operator {
    BETWEEN = "between"
}

export interface ConseilV2Ordering {
    field: string,
    direction: ConseilV2SortDirection
}

export interface ConseilV2Predicate {
    field: string,
    operation: string,
    set: string[],
    inverse: boolean
}

export interface ConseilV2Filter {
    fields: string[],
    predicates: ConseilV2Predicate[],
    orderBy: ConseilV2Ordering,
    limit: number
}

export namespace ConseilV2Query {

    export function runMetadataQuery(
        server: string,
        route: string,
        apiKey: string
    ): Promise<object> {
        const url = `${server}/v2/metadata/${route}`;
        console.log(`Querying Conseil server at URL ${url}`);
        return fetch(url, {
            method: 'GET',
            headers: {
                "apiKey": apiKey
            },
        })
            .then(response => {return response.json()});
    }

    export function getPlatforms(server: string, apiKey: string): Promise<object> {
        return runMetadataQuery(server, 'platforms', apiKey)
    }

    export function getNetworks(server: string, apiKey: string, platform: string): Promise<object> {
        return runMetadataQuery(server, `${platform}/networks`, apiKey)
    }

    export function getEntities(server: string, apiKey: string, platform: string, network: string): Promise<object> {
        return runMetadataQuery(server, `${platform}/${network}/entities`, apiKey)
    }

    export function getAttributes(server: string, apiKey: string, platform: string, network: string, entity: string): Promise<object> {
        return runMetadataQuery(server, `${platform}/${network}/${entity}/attributes`, apiKey)
    }

    export function getElements(server: string, apiKey: string, platform: string, network: string, entity: string, attribute: string): Promise<object> {
        return runMetadataQuery(server, `${platform}/${network}/${entity}/${attribute}`, apiKey)
    }

    export function runDataQuery(
        server: string,
        route: string,
        filter: ConseilV2Filter,
        apiKey: string): Promise<object> {
        const url = `${server}/${route}`;
        console.log(`Querying Conseil server at URL ${url}`);
        return fetch(url, {
            method: 'POST',
            headers: {
                "apiKey": apiKey
            },
            body: JSON.stringify(filter)
        })
            .then(response => {return response.json()});
    }

    export function getEmptyFilter(): ConseilV2Filter {
        return {
            fields: [],
            predicates: [],
            orderBy: {
                field: "",
                direction: ConseilV2SortDirection.ASC
            },
            limit: 100
        }
    }

    export function addFieldsToFilter(filter: ConseilV2Filter, fields: string[]): ConseilV2Filter {
        return {
            ...filter,
            fields: filter.fields.concat(fields)
        }
    }

    export function addPredicateToFilter(filter: ConseilV2Filter, field: string, operation: ConseilV2Operator, values: any[], invert: boolean): ConseilV2Filter {
        const newPredicate = {
            field,
            operation,
            set: values,
            inverse: invert
        }
        return {
            ...filter,
            predicates: filter.predicates.concat(newPredicate)
        }
    }

    export function setOrderingForFilter(filter: ConseilV2Filter, field: string, direction: ConseilV2SortDirection): ConseilV2Filter {
        return {
            ...filter,
            orderBy: {field, direction}
        }
    }

    export function setLimitForFilter(filter: ConseilV2Filter, limit: number): ConseilV2Filter {
        return {
            ...filter,
            limit
        }
    }

}
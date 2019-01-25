export enum ConseilSortDirection {
    ASC = 'asc',
    DESC = 'desc'
}

export enum ConseilOperator {
    BETWEEN = 'between',
    EQ = 'eq'
}

export interface ConseilOrdering {
    field: string,
    direction: ConseilSortDirection
}

export interface ConseilPredicate {
    field: string,
    operation: string,
    set: any[],
    inverse: boolean
}

export interface ConseilFilter {
    fields: string[],
    predicates: ConseilPredicate[],
    orderBy: ConseilOrdering[],
    limit: number
}

export namespace ConseilQuery {
    export function getEmptyFilter(): ConseilFilter {
        return {
            fields: [],
            predicates: [],
            orderBy: [],
            limit: 100
        }
    }

    export function addFieldsToFilter(filter: ConseilFilter, fields: string[]): ConseilFilter {
        return {
            ...filter,
            fields: filter.fields.concat(fields)
        }
    }

    export function addPredicateToFilter(filter: ConseilFilter, field: string, operation: ConseilOperator, values: any[], invert: boolean = false): ConseilFilter {
        const newPredicate = {
            field,
            operation,
            set: values,
            inverse: invert
        };

        return {
            ...filter,
            predicates: filter.predicates.concat(newPredicate)
        }
    }

    export function setOrderingForFilter(filter: ConseilFilter, field: string, direction: ConseilSortDirection = ConseilSortDirection.ASC): ConseilFilter {
        return {
            ...filter,
            orderBy: filter.orderBy.concat({ field, direction })
        }
    }

    export function setLimitForFilter(filter: ConseilFilter, limit: number): ConseilFilter {
        return {
            ...filter,
            limit
        }
    }
}

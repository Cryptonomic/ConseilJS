export interface ConseilServerInfo {
    url: string;
    apiKey: string;
}

export enum ConseilSortDirection {
    ASC = 'asc',
    DESC = 'desc'
}

export enum ConseilOperator {
    BETWEEN = 'between',
    EQ = 'eq',
    IN = 'in',
    LIKE = 'like',
    LT = 'lt',
    BEFORE = 'before',
    GT = 'gt', 
    AFTER = 'after',
    STARTSWITH = 'startsWith',
    ENDSWITH = 'endsWith'
}

export interface ConseilOrdering {
    field: string,
    direction: ConseilSortDirection
}

export interface ConseilPredicate {
    field: string,
    operation: ConseilOperator,
    set: any[],
    inverse: boolean
}

export interface ConseilQuery {
    fields: Set<string>;
    predicates: ConseilPredicate[];
    orderBy: ConseilOrdering[];
    limit: number;
}

export namespace ConseilQueryBuilder {
    export function blankQuery(): ConseilQuery {
        return {
            'fields': new Set(),
            'predicates': [],
            'orderBy': [],
            'limit': 100
        }
    }

    /**
     * 
     * @param field 
     */
    export function addField(query: ConseilQuery, field: string): ConseilQuery {
        let q = {...query};
        q.fields.add(field);

        return q;
    }

    export function addFields(query: ConseilQuery, fields: string[]): ConseilQuery {
        let q = {...query};
        fields.forEach(f => q.fields.add(f));

        return q;
    }

    export function addPredicate(query: ConseilQuery, field: string, operation: ConseilOperator, values: any[], invert: boolean = false): ConseilQuery {
        if (operation === ConseilOperator.BETWEEN && values.length !== 2) {
            throw new Error();
        } else if (operation === ConseilOperator.IN && values.length < 2) {
            throw new Error();
        } else if (values.length !== 1) {
            throw new Error();
        }

        let q = {...query};
        q.predicates.concat({ field, operation, set: values, inverse: invert });

        return q;
    }

    export function setOrdering(query: ConseilQuery, field: string, direction: ConseilSortDirection = ConseilSortDirection.ASC): ConseilQuery {
        // TODO: validate field uniqueness
        let q = {...query};
        q.orderBy.concat({ field, direction });

        return q;
    }

    export function setLimit(query: ConseilQuery, limit: number): ConseilQuery {
        if (limit < 1) { throw new Error(); }

        let q = {...query};
        q.limit = limit;

        return q;
    }
}

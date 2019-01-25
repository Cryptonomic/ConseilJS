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

export class ConseilQuery {
    fields: string[];
    predicates: ConseilPredicate[];
    orderBy: ConseilOrdering[];
    limit: number;

    constructor(){
        this.fields = [];
        this.predicates =[]
        this.orderBy = []
        this.limit = 100
    }

    addFields(fields: string[]): ConseilQuery {
        this.fields.concat(fields);

        return this;
    }

    addPredicate(field: string, operation: ConseilOperator, values: any[], invert: boolean = false): ConseilQuery {
        this.predicates.concat({ field, operation, set: values, inverse: invert });

        return this;
    }

    setOrdering(field: string, direction: ConseilSortDirection = ConseilSortDirection.ASC): ConseilQuery {
        this.orderBy.concat({ field, direction })

        return this;
    }

    setLimit(limit: number): ConseilQuery {
        this.limit = limit;

        return this;
    }
}

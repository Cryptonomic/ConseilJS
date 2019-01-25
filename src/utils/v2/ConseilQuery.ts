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

export class ConseilQuery {
    fields: Set<string>;
    predicates: ConseilPredicate[];
    orderBy: ConseilOrdering[];
    limit: number;

    constructor(){
        this.fields = new Set<string>();
        this.predicates = [];
        this.orderBy = [];
        this.limit = 100;
    }

    addField(field: string): ConseilQuery {
        this.fields.add(field);

        return this;
    }

    addFields(fields: string[]): ConseilQuery {
        fields.forEach(f => this.fields.add(f));

        return this;
    }

    addPredicate(field: string, operation: ConseilOperator, values: any[], invert: boolean = false): ConseilQuery {
        if (operation === ConseilOperator.BETWEEN && values.length !== 2) {
            throw new Error();
        } else if (operation === ConseilOperator.IN && values.length < 2) {
            throw new Error();
        } else if (values.length !== 1) {
            throw new Error();
        }

        this.predicates.concat({ field, operation, set: values, inverse: invert });

        return this;
    }

    setOrdering(field: string, direction: ConseilSortDirection = ConseilSortDirection.ASC): ConseilQuery {
        // TODO: validate field uniqueness
        this.orderBy.concat({ field, direction });

        return this;
    }

    setLimit(limit: number): ConseilQuery {
        if (limit < 1) { throw new Error(); }

        this.limit = limit;

        return this;
    }
}

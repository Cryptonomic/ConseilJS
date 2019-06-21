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
    ENDSWITH = 'endsWith',
    ISNULL = 'isnull'
}

export enum ConseilFunction {
    avg = 'avg',
    count = 'count',
    max = 'max',
    min = 'min',
    sum = 'sum'
}

export enum ConseilOutput {
    csv = 'csv',
    json = 'json'
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
    fields: string[];
    predicates: ConseilPredicate[];
    orderBy: ConseilOrdering[];
    limit: number;
    aggregation?: ConseilAggregation[];
    output?: string;
}

export interface ConseilAggregation {
    field: string,
    function: ConseilFunction
}
export interface ConseilServerInfo {
    url: string;
    apiKey: string;
}
export declare enum ConseilSortDirection {
    ASC = "asc",
    DESC = "desc"
}
export declare enum ConseilOperator {
    BETWEEN = "between",
    EQ = "eq",
    IN = "in",
    LIKE = "like",
    LT = "lt",
    BEFORE = "before",
    GT = "gt",
    AFTER = "after",
    STARTSWITH = "startsWith",
    ENDSWITH = "endsWith"
}
export interface ConseilOrdering {
    field: string;
    direction: ConseilSortDirection;
}
export interface ConseilPredicate {
    field: string;
    operation: ConseilOperator;
    set: any[];
    inverse: boolean;
}
export declare class ConseilQuery {
    fields: Set<string>;
    predicates: ConseilPredicate[];
    orderBy: ConseilOrdering[];
    limit: number;
    constructor();
    addField(field: string): ConseilQuery;
    addFields(fields: string[]): ConseilQuery;
    addPredicate(field: string, operation: ConseilOperator, values: any[], invert?: boolean): ConseilQuery;
    setOrdering(field: string, direction?: ConseilSortDirection): ConseilQuery;
    setLimit(limit: number): ConseilQuery;
}

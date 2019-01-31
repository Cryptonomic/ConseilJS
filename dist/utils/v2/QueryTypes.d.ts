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
export interface ConseilQuery {
    fields: string[];
    predicates: ConseilPredicate[];
    orderBy: ConseilOrdering[];
    limit: number;
}
export declare class ConseilRequestError extends Error {
    httpStatus: number;
    httpMessage: string;
    conseilURL: string;
    conseilQuery: ConseilQuery;
    constructor(httpStatus: number, httpMessage: string, conseilURL: string, conseilQuery: ConseilQuery);
}

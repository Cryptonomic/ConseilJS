import { ConseilQuery, ConseilOperator, ConseilSortDirection } from "../../types/conseil/QueryTypes";
export declare namespace ConseilQueryBuilder {
    function blankQuery(): ConseilQuery;
    function addFields(query: ConseilQuery, ...fields: string[]): ConseilQuery;
    function addPredicate(query: ConseilQuery, field: string, operation: ConseilOperator, values: any[], invert?: boolean): ConseilQuery;
    function addOrdering(query: ConseilQuery, field: string, direction?: ConseilSortDirection): ConseilQuery;
    function setLimit(query: ConseilQuery, limit: number): ConseilQuery;
}

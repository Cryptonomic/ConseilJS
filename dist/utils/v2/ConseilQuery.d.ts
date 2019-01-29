import { ConseilQuery, ConseilOperator, ConseilSortDirection } from "../v2/QueryTypes";
export declare namespace ConseilQueryBuilder {
    /**
     * Creates an empty ConseilQuery object with limit set to 100.
     */
    function blankQuery(): ConseilQuery;
    /**
     * Appends one or more fields to the query. A new query object is returned.
     *
     * @param query Source query.
     * @param fields Fields to add.
     */
    function addFields(query: ConseilQuery, ...fields: string[]): ConseilQuery;
    /**
     * Appends a predicate to the query. A new query object is returned.
     *
     * @param query Source query.
     * @param field Field to apply the operation to.
     * @param operation Operation to apply. ConseilOperator.IN requires two or more values, ConseilOperator.BETWEEN is inclusive and requires two values, all other operators require at least one value.
     * @param values Set of values to operate on.
     * @param invert Set inverse, default is false. This is equivalent to matching inside the set of values as in SQL IN command. Setting inverse true is interpreted as NOT IN.
     */
    function addPredicate(query: ConseilQuery, field: string, operation: ConseilOperator, values: any[], invert?: boolean): ConseilQuery;
    /**
     * Appends an ordering instructionc to the query. Ordering is possible on fields that are not part of the result set. A new query object is returned.
     *
     * @param query Source query.
     * @param field Field name to order by.
     * @param direction Sort direction.
     */
    function addOrdering(query: ConseilQuery, field: string, direction?: ConseilSortDirection): ConseilQuery;
    /**
     * Sets a maximum result set size on a query. A new query object is returned.
     *
     * @param query Source query.
     * @param limit Maximum number of rows to return, must be 1 or more.
     */
    function setLimit(query: ConseilQuery, limit: number): ConseilQuery;
}

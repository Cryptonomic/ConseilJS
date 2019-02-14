[conseiljs](../README.md) > [ConseilQueryBuilder](../modules/conseilquerybuilder.md)

# Module: ConseilQueryBuilder

## Index

### Functions

* [addFields](conseilquerybuilder.md#addfields)
* [addOrdering](conseilquerybuilder.md#addordering)
* [addPredicate](conseilquerybuilder.md#addpredicate)
* [blankQuery](conseilquerybuilder.md#blankquery)
* [setLimit](conseilquerybuilder.md#setlimit)

---

## Functions

<a id="addfields"></a>

###  addFields

▸ **addFields**(query: *[ConseilQuery](../interfaces/conseilquery.md)*, ...fields: *`string`[]*): [ConseilQuery](../interfaces/conseilquery.md)

*Defined in [reporting/ConseilQueryBuilder.ts:22](https://github.com/Cryptonomic/ConseilJS/blob/6ee1a2c/src/reporting/ConseilQueryBuilder.ts#L22)*

Appends one or more fields to the query. A new query object is returned.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| query | [ConseilQuery](../interfaces/conseilquery.md) |  Source query. |
| `Rest` fields | `string`[] |  Fields to add. |

**Returns:** [ConseilQuery](../interfaces/conseilquery.md)

___
<a id="addordering"></a>

###  addOrdering

▸ **addOrdering**(query: *[ConseilQuery](../interfaces/conseilquery.md)*, field: *`string`*, direction?: *[ConseilSortDirection](../enums/conseilsortdirection.md)*): [ConseilQuery](../interfaces/conseilquery.md)

*Defined in [reporting/ConseilQueryBuilder.ts:62](https://github.com/Cryptonomic/ConseilJS/blob/6ee1a2c/src/reporting/ConseilQueryBuilder.ts#L62)*

Appends an ordering instructionc to the query. Ordering is possible on fields that are not part of the result set. A new query object is returned.

**Parameters:**

| Name | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| query | [ConseilQuery](../interfaces/conseilquery.md) | - |  Source query. |
| field | `string` | - |  Field name to order by. |
| `Default value` direction | [ConseilSortDirection](../enums/conseilsortdirection.md) |  ConseilSortDirection.ASC |  Sort direction. |

**Returns:** [ConseilQuery](../interfaces/conseilquery.md)

___
<a id="addpredicate"></a>

###  addPredicate

▸ **addPredicate**(query: *[ConseilQuery](../interfaces/conseilquery.md)*, field: *`string`*, operation: *[ConseilOperator](../enums/conseiloperator.md)*, values: *`any`[]*, invert?: *`boolean`*): [ConseilQuery](../interfaces/conseilquery.md)

*Defined in [reporting/ConseilQueryBuilder.ts:40](https://github.com/Cryptonomic/ConseilJS/blob/6ee1a2c/src/reporting/ConseilQueryBuilder.ts#L40)*

Appends a predicate to the query. A new query object is returned.

**Parameters:**

| Name | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| query | [ConseilQuery](../interfaces/conseilquery.md) | - |  Source query. |
| field | `string` | - |  Field to apply the operation to. |
| operation | [ConseilOperator](../enums/conseiloperator.md) | - |  Operation to apply. ConseilOperator.IN requires two or more values, ConseilOperator.BETWEEN is inclusive and requires two values, all other operators require at least one value. |
| values | `any`[] | - |  Set of values to operate on. |
| `Default value` invert | `boolean` | false |  Set inverse, default is false. This is equivalent to matching inside the set of values as in SQL IN command. Setting inverse true is interpreted as NOT IN. |

**Returns:** [ConseilQuery](../interfaces/conseilquery.md)

___
<a id="blankquery"></a>

###  blankQuery

▸ **blankQuery**(): [ConseilQuery](../interfaces/conseilquery.md)

*Defined in [reporting/ConseilQueryBuilder.ts:7](https://github.com/Cryptonomic/ConseilJS/blob/6ee1a2c/src/reporting/ConseilQueryBuilder.ts#L7)*

Creates an empty ConseilQuery object with limit set to 100.

**Returns:** [ConseilQuery](../interfaces/conseilquery.md)

___
<a id="setlimit"></a>

###  setLimit

▸ **setLimit**(query: *[ConseilQuery](../interfaces/conseilquery.md)*, limit: *`number`*): [ConseilQuery](../interfaces/conseilquery.md)

*Defined in [reporting/ConseilQueryBuilder.ts:76](https://github.com/Cryptonomic/ConseilJS/blob/6ee1a2c/src/reporting/ConseilQueryBuilder.ts#L76)*

Sets a maximum result set size on a query. A new query object is returned.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| query | [ConseilQuery](../interfaces/conseilquery.md) |  Source query. |
| limit | `number` |  Maximum number of rows to return, must be 1 or more. |

**Returns:** [ConseilQuery](../interfaces/conseilquery.md)

___


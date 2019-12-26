# ConseilJS Change Log

## 0.3.3-beta

## 0.3.3-alpha

### Breaking Changes

- `TezosNodeWriter.applyOperation` was renamed to `TezosNodeWriter.preapplyOperation`
- `TezosNodeWriter.testOperation` was renamed to `TezosNodeWriter.testContractInvocationOperation` and now estimates cost of contract invocation
- `TezosConseilClient.getBlock` now returns a single item, not an array
- `TezosConseilClient.getAccount` now returns a single item, not an array
- `TezosConseilClient.getOperationGroup` now returns a single item, not an array

### Fixes

- custom entry point hex encoding, thanks to [@elkesrio](https://github.com/elkesrio)

### Known issues

- Michelson lambda parameter encoding is not yet supported
- Michelson `DIG`, `DUG`, `EMPTY_BIG_MAP`, `APPLY`, `CHAIN_ID` operations are not supported

### Future Breaking Changes

- `KeyStore` now contains `derivationPath`, in a subsequent release, functions that accept a `KeyStore` parameter and a `derivationPath` parameter will be modified to take only the former.

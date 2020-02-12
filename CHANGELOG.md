<!-- markdownlint-disable MD024 -->
# ConseilJS Change Log

## 0.4.0-beta

### Breaking Changes

- Moved `chain/tezos/TezosProtocolHelper.ts` to `/chain/tezos/contracts/BabylonDelegationHelper`.
- `TezosConseilClient.getBlockByLevel`, `TezosConseilClient.getAccount`, `TezosConseilClient.getOperationGroup` now return single items, not arrays of 1.
- `EntryPoint.generateInvocationPair()` now returns a tuple with `entrypoint` and `parameters` keys.
- `TezosConseilClient.awaitOperationConfirmation` now returns a single item, not an array.
- Removed `CryptoUtils.getPasswordStrength()` and the related zxcvbn dependency. This functionality should be added by the implementing application.
- `TezosNodeWriter.preapplyOperation()`, `testContractInvocationOperation()` and `injectOperation()` now parse and report errors.
- nodejs 12.14 is now a base requirement.

### Fixes

- Improved `TezosNodeReader.getAccountManagerForBlock`.
- `TezosNodeReader.isImplicitAndEmpty` and `TezosNodeReader.isManagerKeyRevealedForAccount` now default to head by reference instead of query.
- Added `TezosNodeReader.getContractStorage`.
- Michelson parser support for `D\[UI\]G n`, `D\[UI\]P n`, `DROP n`.
- Generally improved Michelson contract parser.
- Improved `TezosContractIntrospector` parser.

### New Features

- added Tezos Commons Baker Registry interface `chain/tezos/contracts/TCFBakerRegistryHelper`.
- added TZIP 0007 (FA1.2) token contract interface `chain/tezos/contracts/Tzip7ReferenceTokenHelper`.
- `TezosMessageUtil` can now `pack` `key_hash` value.

## 0.3.8-beta

- updated various dependencies, importantly for Ledger device communication

## 0.3.7

### Fixes

- big_int encoding

## 0.3.6

### Fixes

- integer encoding issue introduced in 0.3.5-beta

## 0.3.5-beta

### Breaking Changes

- `EntryPoint.generateParameter` became `EntryPoint.generateInvocationString`.

### Fixes

- Improved entry point parser, this functionality is still experimental.
- Added `EntryPoint.generateInvocationPair` to produce Protocol 005 style invocation parameters.
- `ConseilPredicate` gained a `group` attribute for `or` queries.
- removed `base-n` dependency.

## 0.3.4-beta

### Fixes

- basic big_map query support.
- nodejs 10.17.x is now the minimum requirement.
- all dependencies are now referenced with explicit versions.

## 0.3.3-beta

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

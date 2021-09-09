import FetchSelector from './utils/FetchSelector';
import LogSelector from './utils/LoggerSelector';

export function registerLogger(logger) {
    LogSelector.setLogger(logger);
}

export function registerFetch(fetch) {
    FetchSelector.setFetch(fetch);
}

export * from './chain/tezos/TezosContractIntrospector';
export * from './chain/tezos/TezosLanguageUtil';
export * from './chain/tezos/TezosMessageUtil';
export * from "./chain/tezos/TezosNodeReader";
export * from "./chain/tezos/TezosNodeWriter";
export * from './chain/tezos/contracts/TezosContractUtils';
export * from './chain/tezos/contracts/BabylonDelegationHelper';
export * from './chain/tezos/contracts/CryptonomicNameServiceHelper';
export * from './chain/tezos/contracts/DexterPoolHelper';
export * from './chain/tezos/contracts/HicNFT';
export * from './chain/tezos/contracts/Kalamint';
export * from './chain/tezos/contracts/KolibriTokenHelper';
export * from './chain/tezos/contracts/MurbardMultisigHelper';
export * from './chain/tezos/contracts/TCFBakerRegistryHelper';
export * from './chain/tezos/contracts/Tzip7ReferenceTokenHelper';
export * from './chain/tezos/contracts/tzip12/ChainlinkTokenHelper';
export * from './chain/tezos/contracts/tzip12/MultiAssetTokenHelper';
export * from './chain/tezos/contracts/tzip12/SingleAssetTokenHelper';
export * from './chain/tezos/contracts/TzbtcTokenHelper';
export * from './chain/tezos/contracts/WrappedTezosHelper';
export * from './chain/tezos/contracts/tezfin/TezFinHelper';
export * from './chain/tezos/contracts/tezfin/CToken';
export * from './chain/tezos/contracts/tezfin/Comptroller';
export * from './chain/tezos/contracts/tezfin/Governance';

export * from "./reporting/tezos/TezosConseilClient";

export * from './reporting/ConseilDataClient';
export * from './reporting/ConseilMetadataClient';
export * from './reporting/ConseilQueryBuilder';

export * from './types/conseil/MetadataTypes';
export * from './types/conseil/QueryTypes';
export * from './types/tezos/TezosConstants';
export * from './types/tezos/ContractIntrospectionTypes';
export * from './types/tezos/TezosChainTypes';
export * from './types/tezos/TezosP2PMessageTypes';
export * from './types/tezos/TezosRPCResponseTypes';
export * from './types/ExternalInterfaces';

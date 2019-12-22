import fetch from 'node-fetch';
import * as log from 'loglevel';

import FetchSelector from './utils/FetchSelector';
import DeviceSelector from './utils/DeviceSelector';
import LogSelector from './utils/LoggerSelector';
import { TezosLedgerWallet } from './identity/tezos/TezosLedgerWallet';

FetchSelector.setFetch(fetch);
DeviceSelector.setLedgerUtils(TezosLedgerWallet);
LogSelector.setLogger(log.getLogger('conseiljs'));
LogSelector.setLevel('error');

export function setLogLevel(level: string) {
    LogSelector.setLevel(level);
}

export * from './chain/tezos/TezosContractIntrospector';
export * from './chain/tezos/TezosLanguageUtil';
export * from './chain/tezos/TezosMessageUtil';
export * from "./chain/tezos/TezosNodeReader";
export * from "./chain/tezos/TezosNodeWriter";
export * from './chain/tezos/contracts/BabylonDelegationHelper';
export * from './chain/tezos/contracts/TCFBakerRegistryHelper';

export * from "./identity/tezos/TezosFileWallet";
export * from "./identity/tezos/TezosLedgerWallet";
export * from "./identity/tezos/TezosWalletUtil";

export * from "./reporting/tezos/TezosConseilClient";

export * from './reporting/ConseilDataClient';
export * from './reporting/ConseilMetadataClient';
export * from './reporting/ConseilQueryBuilder';

export * from './types/conseil/MetadataTypes';
export * from './types/conseil/QueryTypes';
export * from './types/tezos/ContractIntrospectionTypes';
export * from './types/tezos/TezosChainTypes';
export * from './types/tezos/TezosP2PMessageTypes';
export * from './types/tezos/TezosRPCResponseTypes';
export * from './types/wallet/KeyStore';

export * from './utils/CryptoUtils';

import fetch from 'node-fetch';
import FetchInstance from './utils/FetchInstance';
import DeviceUtils from './utils/DeviceUtils';
import * as LedgerUtils from './utils/LedgerUtils';

FetchInstance.setFetch(fetch);
DeviceUtils.setLedgerUtils(LedgerUtils);

export * from "./tezos/TezosConseilQuery";
export * from "./tezos/TezosNodeQuery";
export * from "./tezos/TezosOperations";
export * from "./tezos/TezosWallet";
export * from "./tezos/TezosHardwareWallet";
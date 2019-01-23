import fetch from 'node-fetch';
import FetchInstance from './utils/FetchInstance';
import DeviceUtils from './utils/DeviceUtils';
import * as LedgerUtils from './utils/LedgerUtils';

const myFetch = typeof window === 'undefined' ? fetch : window.fetch;
FetchInstance.setFetch(myFetch);
DeviceUtils.setLedgerUtils(LedgerUtils);

export * from "./tezos/TezosConseilQuery";
export * from "./tezos/TezosNodeQuery";
export * from "./tezos/TezosOperations";
export * from "./tezos/TezosWallet";
export * from "./tezos/TezosHardwareWallet";
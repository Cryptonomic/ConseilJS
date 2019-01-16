import 'whatwg-fetch';
import FetchInstance from './utils/FetchInstance';

FetchInstance.setFetch(window.fetch);

export * from "./tezos/TezosConseilQuery";
export * from "./tezos/TezosNodeQuery";
export * from "./tezos/TezosOperations";
export * from "./tezos/TezosWallet";

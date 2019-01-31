import FetchSelector from './utils/FetchSelector';

FetchSelector.setFetch(window.fetch);

export * from "./tezos/TezosConseilQuery";
export * from "./tezos/TezosNodeQuery";
export * from "./tezos/TezosOperations";
export * from "./tezos/TezosWallet";
export * from "./tezos/TezosConseilClient";

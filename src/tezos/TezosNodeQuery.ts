import debug from "debug";
import * as Nautilus from "../utils/NautilusQuery";
import * as TezosTypes from "./TezosTypes";
import { BlockMetadata } from "./TezosTypes";

const queryDebugLog = debug("conseilJS:query:debug");

/**
 * Utility functions for interacting with the Tezos node.
 */
export namespace TezosNode {
  /**
   * Gets a given block.
   * @param {string} server  Which Tezos node to go against
   * @param {String} hash Hash of the given block
   * @returns {Promise<BlockMetadata>} Block
   */
  export function getBlock(
    server: string,
    hash: string
  ): Promise<BlockMetadata> {
    queryDebugLog(`Running getBlock Query`);
    return Nautilus.runGetQuery(server, `/chains/main/blocks/${hash}`).then(
      json => {
        return <TezosTypes.BlockMetadata>json;
      }
    );
  }

  /**
   * Gets the block head.
   * @param {string} server  Which Tezos node to go against
   * @returns {Promise<BlockMetadata>} Block head
   */
  export function getBlockHead(
    server: string
  ): Promise<TezosTypes.BlockMetadata> {
    return getBlock(server, "head");
  }

  /**
   * Fetches a specific account for a given block.
   * @param {string} server  Which Tezos node to go against
   * @param {string} blockHash    Hash of given block
   * @param {string} accountID    Account ID
   * @returns {Promise<Account>}  The account
   */
  export function getAccountForBlock(
    server: string,
    blockHash: string,
    accountID: string
  ): Promise<TezosTypes.Account> {
    queryDebugLog(`Running getAccountForBlock Query`);
    return Nautilus.runGetQuery(
      server,
      `/chains/main/blocks/${blockHash}/context/contracts/${accountID}`
    ).then(json => {
      return <TezosTypes.Account>json;
    });
  }

  /**
   * Fetches the manager of a specific account for a given block.
   * @param {string} server  Which Tezos node to go against
   * @param {string} blockHash    Hash of given block
   * @param {string} accountID    Account ID
   * @returns {Promise<ManagerKey>}   The account
   */
  export function getAccountManagerForBlock(
    server: string,
    blockHash: string,
    accountID: string
  ): Promise<TezosTypes.ManagerKey> {
    queryDebugLog(`Running getAccountManagerForBlock Query`);
    return Nautilus.runGetQuery(
      server,
      `/chains/main/blocks/${blockHash}/context/contracts/${accountID}/manager_key`
    ).then(json => {
      return <TezosTypes.ManagerKey>json;
    });
  }

  /**
   * Forge an operation group using the Tezos RPC client.
   * @param {string} server  Which Tezos node to go against
   * @param {object} opGroup  Operation group payload
   * @returns {Promise<string>}  Forged operation
   */
  export async function forgeOperation(
    server: string,
    opGroup: object
  ): Promise<string> {
    queryDebugLog(`Running forgeOperation Query`);
    const response = await Nautilus.runPostQuery(
      server,
      "/chains/main/blocks/head/helpers/forge/operations",
      opGroup
    );
    const forgedOperation = await response.text();

    queryDebugLog("Forge operation >> ", forgedOperation);
    return (
      forgedOperation
        .replace(/\n/g, "")
        //.replace('\"', '')
        .replace(/['"]+/g, "")
    );
  }

  /**
   * Applies an operation using the Tezos RPC client.
   * @param {string} server  Which Tezos node to go against
   * @param {object} payload  Payload set according to protocol spec
   * @returns {Promise<AppliedOperation>} Applied operation
   */
  export async function applyOperation(
    server: string,
    payload: object
  ): Promise<TezosTypes.AlphaOperationsWithMetadata[]> {
    queryDebugLog(`Running applyOperation Query`);
    const response = await Nautilus.runPostQuery(
      server,
      `/chains/main/blocks/head/helpers/preapply/operations`,
      payload
    );
    const json = await response.json();

    queryDebugLog("Apply operation >> ", json);
    const appliedOperation = <TezosTypes.AlphaOperationsWithMetadata[]>json;
    return appliedOperation;
  }

  /**
   *
   * @param {string} server  Which Tezos node to go against
   * @param {object} payload  Payload set according to protocol spec
   * @returns {Promise<InjectedOperation>} Injected operation
   */
  export async function injectOperation(
    server: string,
    payload: string
  ): Promise<string> {
    queryDebugLog(`Running injectOperation Query`);
    const response = await Nautilus.runPostQuery(
      server,
      `injection/operation?chain=main`,
      payload
    );
    const injectedOperation = await response.text();
    queryDebugLog("Injected operation >> ", injectedOperation);
    return injectedOperation;
  }
}

import { CToken } from './CToken';
import { Comptroller } from './Comptroller';

export namespace TezFinHelper {
    /*
     * Addresses of the protocol contracts
     *
     * @param cTokens List of cToken contract addresses
     * @param comptroller Comptroller contract address
     * @param interestRateModel InterestRateModel contract address
     * @param governance Governance contract address
    */
    export interface ProtocolAddresses {
        cTokens: string[];
        comptroller: string;
        interestRateModel: string;
        governance: string;
    }

    export const protocolAddresses: ProtocolAddresses = {
        cTokens: [
            '',
            ''
        ],
        comptroller: '',
        interestRateModel: '',
        governance: ''
    }

    // TODO: Price feed oracle
    export interface PriceFeed {
        address: string;
    }

    /*
     * Represents an address' LTV status across the platform, denominated in USD according to the price feed
     *
     * @param supplyBalance Total value supplied
     * @param supplyAPY Current supply APY across assets
     * @param collateralBalance Total value collateralized
     * @param borrowBalance Total value borrowed
     * @param borrowAPY Current borrow APY across assets
     * @param collateralFactor Max fraction of total value supplied available for use as collateral
     * @param LTV Loan-to-value ratio = borrowBalance / (supplyBalance * collateralFactor)
     */
    export interface LTVStatus {
        supplyBalance: number;
        supplyAPY: number;
        collateralBalance: number;
        borrowBalance: number;
        borrowAPY: number;
        collateralFactor: number;
        LTV: number;
    }

    /*
     * Get an account's LTV across given markets
     *
     * @param markets Array of cTokens over which to calculate LTV
     * @param priceFeed Protocol's price feed oracle
     * @param address The address for which to calculate LTV
     */
    export function getLTVStatus(markets: CToken.MarketInfo[], priceFeed: PriceFeed, address: string): LTVStatus {
        // TODO: for each market, call getAccountStatus() and sum over all markets using price feed
        return {} as LTVStatus;
    }
}

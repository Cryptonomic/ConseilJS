import { expect } from 'chai';
import { DexterPoolHelper } from '../../../../src/chain/tezos/contracts/DexterPoolHelper';

describe('DexterPoolHelper test suite', () => {
    it('calcTokenLiquidityRequirement tests', () => {
        // TODO
        //let result = DexterPoolHelper.calcTokenLiquidityRequirement(xtzDeposit: number, tokenBalance: number, xtzBalance: number)
    });

    /**
     * Test samples retrieved from https://gitlab.com/camlcase-dev/dexter-integration/-/raw/master/xtz_to_token.json on 2020/Oct/21.
     */
    it('getTokenExchangeRate tests', () => {
        const camlCaseSamples = [
            { "xtz_pool": "1000000000", "token_pool": "250000", "xtz_in": "1000000", "token_out": "249", "slippage": "0.0040" },
            { "xtz_pool": "1000000000", "token_pool": "250000", "xtz_in": "2000000", "token_out": "497", "slippage": "0.0059" },
            { "xtz_pool": "1000000000", "token_pool": "250000", "xtz_in": "5000000", "token_out": "1240", "slippage": "0.0079" },
            { "xtz_pool": "1000000000", "token_pool": "250000", "xtz_in": "10000000", "token_out": "2467", "slippage": "0.0132" },
            { "xtz_pool": "1000000000", "token_pool": "250000", "xtz_in": "100000000", "token_out": "22665", "slippage": "0.0934" },
            { "xtz_pool": "355200000", "token_pool": "30000", "xtz_in": "1000000", "token_out": "83", "slippage": "0.0172" },
            { "xtz_pool": "355200000", "token_pool": "30000", "xtz_in": "34020000", "token_out": "2614", "slippage": "0.0902" },
            { "xtz_pool": "10000000000", "token_pool": "15200", "xtz_in": "10000000", "token_out": "15", "slippage": "0.0131" },
            { "xtz_pool": "10000000000", "token_pool": "15200", "xtz_in": "23100000", "token_out": "34", "slippage": "0.0316" },
            { "xtz_pool": "10000000000", "token_pool": "15200", "xtz_in": "67000000", "token_out": "100", "slippage": "0.01806" },
            { "xtz_pool": "10000000000", "token_pool": "15200", "xtz_in": "1050000", "token_out": "1", "slippage": "0.3734" },
            { "xtz_pool": "10000000000", "token_pool": "15200", "xtz_in": "4423000", "token_out": "6", "slippage": "0.1075" },
            { "xtz_pool": "103000000", "token_pool": "101000", "xtz_in": "1000000", "token_out": "968", "slippage": "0.0128" },
            { "xtz_pool": "10000000", "token_pool": "1000", "xtz_in": "2000000", "token_out": "166", "slippage": "0.1700" },
            { "xtz_pool": "12000000", "token_pool": "834", "xtz_in": "2500000", "token_out": "143", "slippage": "0.1769" },
            { "xtz_pool": "14500000", "token_pool": "691", "xtz_in": "6125000", "token_out": "204", "slippage": "0.3011" },
            { "xtz_pool": "14500000", "token_pool": "1234", "xtz_in": "5000000", "token_out": "315", "slippage": "0.2597" } ];

        for (const sample of camlCaseSamples) {
            const result = DexterPoolHelper.getTokenExchangeRate(Number(sample.xtz_in), Number(sample.token_pool), Number(sample.xtz_pool));

            expect(result.tokenAmount).to.equal(Number(sample.token_out));
        }
    });

    /**
     * * Test samples retrieved from https://gitlab.com/camlcase-dev/dexter-integration/-/raw/master/token_to_xtz.json on 2020/Oct/21.
     */
    it('getXTZExchangeRate tests', () => {
        const camlCaseSamples = [
            { "xtz_pool": "20000000", "token_pool": "1000", "token_in": "1000", "xtz_out": "9984977", "slippage": "0.5007" },
            { "xtz_pool": "20000000", "token_pool": "1000", "token_in": "100", "xtz_out": "1813221", "slippage": "0.0933" },  
            { "xtz_pool": "20000000", "token_pool": "1000", "token_in": "10", "xtz_out": "197431", "slippage": "0.0128" },
            { "xtz_pool": "20000000", "token_pool": "1000", "token_in": "1", "xtz_out": "19920", "slippage": "0.0040" },
            { "xtz_pool": "20000000", "token_pool": "1000", "token_in": "240", "xtz_out": "3861597", "slippage": "0.1955" },
            { "xtz_pool": "20000000", "token_pool": "1000", "token_in": "116", "xtz_out": "2073262", "slippage": "0.1063" },
            { "xtz_pool": "20000000", "token_pool": "1000", "token_in": "923", "xtz_out": "9584586", "slippage": "0.4807" },
            { "xtz_pool": "19500000", "token_pool": "919", "token_in": "100", "xtz_out": "1908461", "slippage": "0.1005" },
            { "xtz_pool": "17591539", "token_pool": "1019", "token_in": "81", "xtz_out": "1291776", "slippage": "0.0762" } ];

        for (const sample of camlCaseSamples) {
            const result = DexterPoolHelper.getXTZExchangeRate(Number(sample.token_in), Number(sample.token_pool), Number(sample.xtz_pool));

            expect(result.xtzAmount).to.equal(Number(sample.xtz_out));
        }
    });

    it('estimateLiquidityAmount tests', () => {
        //estimateLiquidityAmount(xtzDeposit: number, liquidityBalance: number, xtzBalance: number)
    });

    it('estimateShareCost tests', () => {
        //estimateShareCost(xtzBalance: number, tokenBalance: number): { xtzCost: number, tokenCost: number } 
    });
});

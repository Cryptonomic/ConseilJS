import { StakerDaoTzip7 } from './StakerDaoTzip7';

/**
 * Interface for the BLND token on Tezos.
 * 
 * @see {@link https://www.blendtoken.com/|Blend Token}
 * 
 * The token represented by these contracts trades with symbol 'BLND' and is specified with 10^-18 precision.
 * 
 * Canonical Data:
 * - Delphinet:
 *  - Token Contract: KT1CrGrszgGfamZq2Y3vz8zDvujM8kzb1sUf 
 *  - Token Balances Map ID: 20108
 * TODO(keefertaylor): Add additional data for mainnet here.
 *
 * @author Keefer Taylor, Staker Services Ltd <keefer@stakerdao.com>
 */
namespace BlendTokenHelperInternal { }

/*** Combine namespaces */
const BlendTokenHelper = BlendTokenHelperInternal || StakerDaoTzip7
export BlendTokenHelper
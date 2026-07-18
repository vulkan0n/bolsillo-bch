// PUSD (Peso Stable) constants for Modo Estable feature.
// Hardcoded — no BCMR lookup. PUSD is a BCH token with 2 decimal places.
// Updated 2026-07: tokenId sourced from Cauldron mainnet deployment.

export const PUSD_TOKENID =
  "2469acc5afa4b10cb5b5c04afb89c3a3ffd61c5da9c01e26d00951cae2a02544";

export const PUSD_DECIMALS = 2;

// BCH reserve kept aside for transaction fees (1% of incoming BCH).
export const STABLE_RESERVE_PCT = 1n;

// Safety floor: minimum BCH to trigger auto-swap (~200 ARS at sane rates).
// Updated 2026-07: ~$0.40 at $80k/BCH.  PR2 adds dynamic threshold via rate lookup.
export const MIN_SWAP_SATS = 5000n;

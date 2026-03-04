import type { UtxoEntity } from "@/kernel/wallet/UtxoManagerService";

import { hexToBin } from "@/util/hex";

// ── DB row → normalized (useBigInt: true boundary) ──────────────────

/** sql.js row → UtxoEntity (converts tx_pos from BigInt to number) */
export function normalizeUtxoRow(row: Record<string, unknown>): UtxoEntity {
  return { ...row, tx_pos: Number(row.tx_pos) } as UtxoEntity;
}

// ── Normalized → libauth ────────────────────────────────────────────

/** UtxoEntity → libauth Output['token'] (token prefix for signing) */
export function utxoToTokenPrefix(utxo: UtxoEntity) {
  if (!utxo.token_category) return undefined;
  return {
    category: hexToBin(utxo.token_category),
    amount: utxo.token_amount ?? 0n,
    nft:
      utxo.nft_capability === null
        ? undefined
        : {
            capability: utxo.nft_capability,
            commitment: utxo.nft_commitment
              ? hexToBin(utxo.nft_commitment)
              : Uint8Array.of(),
          },
  };
}

import {
  decodeCashAddress,
  encodeCashAddress,
  decodeBase58Address,
  encodeBase58Address,
  CashAddressType,
  assertSuccess,
} from "@bitauth/libauth";
import { validateBip21Uri } from "@/util/uri";

// convertCashAddress: format any valid address to cashaddr or base58 format
export function convertCashAddress(
  address: string,
  format?: "cashaddr" | "tokenaddr" | "base58"
): string {
  const {
    address: prefixedAddress,
    isCashAddress,
    isBase58Address,
  } = validateBip21Uri(address);

  if (!isCashAddress && !isBase58Address) {
    throw new Error(`convertCashAddress: invalid address ${address}`);
  }

  if (!format) {
    return address;
  }

  // [?] assertSuccess since we already passed bip21 validation
  const decoded = assertSuccess(
    isBase58Address
      ? decodeBase58Address(prefixedAddress)
      : decodeCashAddress(prefixedAddress)
  );

  const type =
    format === "tokenaddr"
      ? CashAddressType.p2pkhWithTokens
      : CashAddressType.p2pkh;

  const encodeAddress =
    format === "base58"
      ? () => ({ address: encodeBase58Address("p2pkh", decoded.payload) }) // [!] we simply will not support non-p2pkh base58
      : () =>
          assertSuccess(
            encodeCashAddress({
              ...decoded,
              type,
            })
          );

  const { address: encoded } = encodeAddress();
  return encoded;
}

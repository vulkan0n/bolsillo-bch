import { Decimal } from "decimal.js";
import { decodeCashAddress } from "@bitauth/libauth";

export function validateInvoiceString(invoice) {
  const address = invoice.split("?")[0];
  const amountMatch = invoice.match(/amount=([0-9]*\.?[0-9]{0,8})/);
  const amount = amountMatch === null ? "0" : amountMatch[1];

  const prefixedAddress = address.includes(":")
    ? address
    : `bitcoincash:${address}`;

  const valid = typeof decodeCashAddress(prefixedAddress) === "object";

  const query = new Decimal(amount) > 0 ? `?amount=${amount}` : "";

  return { valid, address: prefixedAddress, amount, query };
}

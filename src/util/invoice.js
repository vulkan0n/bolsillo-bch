import { Decimal } from "decimal.js";
import {
  decodeCashAddress,
  decodeCashAddressFormatWithoutPrefix,
} from "@bitauth/libauth";

function validateInvoiceString(invoice) {
  const address = invoice.split("?")[0];
  const amount = invoice.match(/amount=([0-9]*\.?[0-9]{0,8})/)[1] || "0";

  const valid =
    typeof (address.includes(":")
      ? decodeCashAddress(address)
      : decodeCashAddressFormatWithoutPrefix(address)) === "object";

  const query = new Decimal(amount) > 0 ? `?amount=${amount}` : "";

  return { valid, address, amount, query };
}

export default validateInvoiceString;

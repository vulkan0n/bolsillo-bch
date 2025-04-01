import { useMemo } from "react";
import { useSelector } from "react-redux";
import { selectWalletAddresses } from "@/redux/wallet";
import { truncate } from "@/util/string";
import { convertCashAddress } from "@/util/cashaddr";

interface AddressProps {
  address: string;
  short?: boolean;
  maxLength?: number;
  withPrefix?: boolean;
  color?: string;
  format?: "cashaddr" | "tokenaddr" | "base58";
}

export default function Address({
  address = "-",
  short = false,
  maxLength = 0,
  withPrefix = false,
  color = "",
  format = undefined,
}: AddressProps) {
  const PREFIX_LENGTH = 6;
  const SUFFIX_LENGTH = 6;

  const convertedAddress = useMemo(
    () => convertCashAddress(address, format),
    [address, format]
  );

  const formattedAddress = useMemo(() => {
    const split = convertedAddress.split(":");
    if (split.length > 1) {
      return withPrefix ? split[0].concat(":").concat(split[1]) : split[1];
    }
    return split[0];
  }, [convertedAddress, withPrefix]);

  const truncatedAddress = useMemo(
    () => truncate(formattedAddress, maxLength),
    [formattedAddress, maxLength]
  );

  const prefix = truncatedAddress.substring(0, PREFIX_LENGTH);
  const middle = truncatedAddress.substring(
    PREFIX_LENGTH,
    truncatedAddress.length - SUFFIX_LENGTH
  );
  const suffix = truncatedAddress.substring(
    truncatedAddress.length - SUFFIX_LENGTH
  );

  const myAddresses = useSelector(selectWalletAddresses);
  const myAddress = myAddresses.find((addr) => addr.address === address);

  const isMyAddress = myAddress !== undefined;

  const myAddressStyle =
    color === "" && isMyAddress && myAddress.change === 0
      ? "text-secondary"
      : "";

  const myChangeStyle =
    color === "" && isMyAddress && myAddress.change === 1
      ? "text-yellow-600"
      : "";

  return (
    <span
      className={`tracking-tighter ${color} ${myAddressStyle} ${myChangeStyle} truncate`}
    >
      <span className="font-bold">{prefix}</span>
      {short ? "-" : middle}
      <span className="font-bold">{suffix}</span>
    </span>
  );
}

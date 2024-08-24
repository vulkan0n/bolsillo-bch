import { useSelector } from "react-redux";
import { selectMyAddresses } from "@/redux/sync";

interface AddressProps {
  address: string;
  short?: boolean;
  maxLength?: number;
  withPrefix?: boolean;
  className?: string;
}

export default function Address({
  address = "-",
  short = false,
  maxLength = 0,
  withPrefix = false,
  className = "",
}: AddressProps) {
  const PREFIX_LENGTH = 5;
  const SUFFIX_LENGTH = 5;

  const truncate = (str, len, sep = "...") => {
    if (str.length <= len) {
      return str;
    }

    const showLength = len - sep.length;

    const front = Math.ceil(showLength / 2);
    const back = Math.floor(showLength / 2);

    return str.substring(0, front) + sep + str.substring(str.length - back);
  };

  const formattedAddress = truncate(
    (() => {
      const split = address.split(":");
      if (split.length > 1) {
        return withPrefix ? split[0].concat(":").concat(split[1]) : split[1];
      }
      return split[0];
    })(),
    maxLength
  );

  const prefix = formattedAddress.substring(0, PREFIX_LENGTH);
  const middle = formattedAddress.substring(
    PREFIX_LENGTH,
    formattedAddress.length - SUFFIX_LENGTH
  );
  const suffix = formattedAddress.substring(
    formattedAddress.length - SUFFIX_LENGTH
  );

  const myAddresses = useSelector(selectMyAddresses);
  const isMyAddress = myAddresses[address] !== undefined;

  const myAddress = isMyAddress ? myAddresses[address] : null;

  const myAddressStyle =
    isMyAddress && myAddress.change === 0 ? "text-secondary" : "";
  const myChangeStyle =
    isMyAddress && myAddress.change === 1 ? "text-yellow-600" : "";

  return (
    <span
      className={`tracking-tighter ${myAddressStyle} ${myChangeStyle} ${className}`}
    >
      <span className="font-bold">{prefix}</span>
      {short ? "-" : middle}
      <span className="font-bold">{suffix}</span>
    </span>
  );
}

import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { selectMyAddresses } from "@/redux/sync";

export default function Address({ address, short }) {
  const PREFIX_LENGTH = 5;
  const SUFFIX_LENGTH = 5;

  const formattedAddress = (() => {
    const split = address.split(":");
    return split.length > 1 ? split[1] : split[0];
  })();

  const prefix = formattedAddress.substring(0, PREFIX_LENGTH);
  const middle = formattedAddress.substring(
    PREFIX_LENGTH,
    formattedAddress.length - SUFFIX_LENGTH
  );
  const suffix = formattedAddress.substring(PREFIX_LENGTH + middle.length);

  const myAddresses = useSelector(selectMyAddresses);
  const isMyAddress = myAddresses[address] !== undefined;

  const myAddress = isMyAddress ? myAddresses[address] : null;

  const myAddressStyle =
    isMyAddress && myAddress.change === 0 ? "text-secondary" : "";
  const myChangeStyle =
    isMyAddress && myAddress.change === 1 ? "text-yellow-600" : "";

  return (
    <span className={`tracking-tighter ${myAddressStyle} ${myChangeStyle}`}>
      <span className="font-bold">{prefix}</span>
      {short ? "-" : middle}
      <span className="font-bold">{suffix}</span>
    </span>
  );
}

Address.propTypes = {
  address: PropTypes.string,
  short: PropTypes.bool,
};

Address.defaultProps = {
  address: "-",
  short: false,
};

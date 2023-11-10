import PropTypes from "prop-types";

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

  return (
    <span className="tracking-tighter">
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

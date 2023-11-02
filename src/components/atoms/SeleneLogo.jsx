import PropTypes from "prop-types";
import { logos } from "@/util/logos";

export default function SeleneLogo({ className, onClick }) {
  return (
    <img
      src={logos.selene.img}
      className={className}
      onClick={onClick}
      alt="Selene Wallet Logo"
    />
  );
}

SeleneLogo.propTypes = {
  className: PropTypes.string,
  onClick: PropTypes.func,
};

SeleneLogo.defaultProps = {
  className: "",
  onClick: () => null,
};

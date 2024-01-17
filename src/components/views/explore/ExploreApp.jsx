import PropTypes from "prop-types";
import { Link } from "react-router-dom";

export default function ExploreApp({ name, icon, to }) {
  const Icon = icon;

  return (
    <Link to={to}>
      <div className="rounded-lg border border-primary bg-zinc-100 my-2 p-1">
        <div className="flex items-center">
          <div className="flex items-center justify-center p-2 text-2xl">
            <Icon />
          </div>
          <div className="text-xl">{name}</div>
        </div>
      </div>
    </Link>
  );
}

ExploreApp.propTypes = {
  name: PropTypes.string.isRequired,
  icon: PropTypes.object,
  to: PropTypes.string,
};

ExploreApp.defaultProps = {
  icon: {},
  to: "",
};

import PropTypes from "prop-types";

export default function Button({
  icon,
  label,
  onClick,
  iconSize = "2xl",
  labelSize = "sm",
  labelColor = "zinc-700",
  inverted,
}) {
  const Icon = icon;
  const inactiveClasses =
    "bg-white text-zinc-600 active:bg-primary active:text-white";
  const activeClasses =
    "bg-primary text-white active:bg-white active:text-zinc-600";
  const colorClasses = inverted ? activeClasses : inactiveClasses;

  return (
    <div className="text-center">
      <button type="button" onClick={onClick}>
        <div
          className={`w-full h-full flex items-center justify-center cursor-pointer p-3 mx-auto
        rounded-full border border-2 border-primary shadow-md opacity-90 
        ${colorClasses}
        active:shadow-none active:shadow-inner`}
        >
          <Icon className={`text-${iconSize}`} />
        </div>
      </button>
      {label && (
        <div
          className={`text-${labelSize} text-${labelColor} mt-1 select-none`}
        >
          {label}
        </div>
      )}
    </div>
  );
}

Button.propTypes = {
  icon: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  label: PropTypes.string,
  onClick: PropTypes.func,
  iconSize: PropTypes.string,
  labelSize: PropTypes.string,
  labelColor: PropTypes.string,
  inverted: PropTypes.bool,
};

Button.defaultProps = {
  icon: null,
  label: "",
  onClick: () => null,
  iconSize: "",
  labelSize: "",
  labelColor: "",
  inverted: false,
};

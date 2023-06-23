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
    "bg-white text-zinc-600 border-zinc-100 active:bg-primary active:border-primary active:text-white";
  const activeClasses =
    "bg-primary border-primary text-white active:bg-white active:text-zinc-600 active:border-zinc-100";
  const colorClasses = inverted ? activeClasses : inactiveClasses;

  return (
    <div className="text-center">
      <button type="button" onClick={onClick} className={`w-full h-full`}>
        <div
          className={`w-full h-full flex items-center justify-center cursor-pointer p-3 mx-auto
        rounded-full outline outline-2 outline-primary shadow-md border opacity-90 
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

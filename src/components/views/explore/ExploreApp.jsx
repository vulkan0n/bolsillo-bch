export default function ExploreApp({ name, icon, description }) {
  const Icon = icon;

  return (
    <div className="rounded-lg border border-primary bg-zinc-100 my-2 p-1">
      <div className="flex items-center">
        <div className="flex items-center justify-center p-2 text-2xl">
          <Icon />
        </div>
        <div>
          <div className="text-xl">{name}</div>
          <div className="">{description}</div>
        </div>
      </div>
    </div>
  );
}

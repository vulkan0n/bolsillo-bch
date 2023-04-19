export default function ViewHeader({ icon, title }) {
  const Icon = icon;
  return (
    <div className="bg-zinc-900 text-xl text-zinc-200 text-center p-3 font-bold">
      <Icon className="text-2xl mx-1" />
      &nbsp;{title}
    </div>
  );
}

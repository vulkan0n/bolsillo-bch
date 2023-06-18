export default function HrLabel({ text, icon }) {
  const Icon = icon;
  return (
    <div className="inline-flex items-center justify-center w-full">
      <hr className="w-full h-px bg-zinc-500/30 border-0 shadow-lg" />
      <span className="absolute px-3 text-zinc-500/80 -translate-x-1/2 bg-white left-1/2 uppercase font-mono text-sm">
        <Icon className="mr-1" />{text}
      </span>
    </div>
  );
}

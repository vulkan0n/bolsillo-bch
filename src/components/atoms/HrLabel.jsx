export default function HrLabel({ text }) {
  return (
    <div className="inline-flex items-center justify-center w-full">
      <hr className="w-full h-px bg-zinc-500/30 border-0 shadow-lg" />
      <span class="absolute px-2 text-zinc-500/80 -translate-x-1/2 bg-white left-1/2 uppercase font-mono text-sm">
        {text}
      </span>
    </div>
  );
}

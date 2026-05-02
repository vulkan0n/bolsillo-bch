export interface PocketBalanceProps {
  fiatAmount: string;
  fiatCurrency?: string;
  bchAmount: string;
  label?: string;
}

export default function PocketBalance({
  fiatAmount,
  fiatCurrency = "$",
  bchAmount,
  label = "TU BOLSILLO",
}: PocketBalanceProps) {
  return (
    <div className="relative pt-7">
      {/* Moneda BCH sobresaliendo por arriba */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-brand-500 flex items-center justify-center z-10">
        <svg
          viewBox="0 0 32 32"
          className="w-7 h-7 text-white"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M19.5 14.4c1.5-.7 2.4-2 2.1-3.9-.4-2.6-2.5-3.4-5.3-3.7l.7-3.6h-2.2l-.7 3.5c-.6 0-1.2 0-1.8.1l.7-3.5H10.8l-.7 3.6h-3.6l-.4 2.4s1.6 0 1.6 0c.6 0 .8.3.7.7l-1.7 8.5c-.1.3-.3.6-.7.6h-1.6l-.6 2.7h3.5l-.7 3.6h2.2l.7-3.6c.6 0 1.2 0 1.8 0l-.7 3.6h2.2l.7-3.6c3.4-.2 5.7-1 6-4.2.2-2.5-1-3.7-2.9-4.2zm-1.5 5.6c-.3 1.5-2.5 1.4-4 1.4-.2 0-.3 0-.4 0l.9-4.4c.1 0 .3 0 .4 0 1.4 0 3.4-.4 3.1 1.5l0 1.5zm.5-7c-.3 1.4-2.1 1.3-3.4 1.3l.8-3.9c1.2 0 3 .2 2.6 1.7l0 .9z" />
        </svg>
      </div>

      {/* Bolsillo */}
      <div className="bg-sky-100 dark:bg-sky-100 border-2 border-dashed border-sky-200 dark:border-sky-400/40 rounded-3xl px-6 py-7">
        {/* Label */}
        <p className="text-overline uppercase text-sky-500 tracking-wider text-center mb-3">
          {label}
        </p>

        {/* Balance fiat */}
        <div className="flex items-baseline justify-center">
          <span className="text-3xl text-neutral-400 mr-1 font-medium">
            {fiatCurrency}
          </span>
          <span className="text-display text-neutral-900 dark:text-neutral-900 tabular">
            {fiatAmount}
          </span>
        </div>

        {/* Sub BCH */}
        <p className="text-sm text-neutral-400 mt-1 tabular text-center">
          {bchAmount} BCH
        </p>
      </div>
    </div>
  );
}

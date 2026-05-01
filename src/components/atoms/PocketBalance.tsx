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
        <span className="text-white font-bold text-2xl leading-none">Ƀ</span>
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

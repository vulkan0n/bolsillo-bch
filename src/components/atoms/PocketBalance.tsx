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
          viewBox="0 0 788 788"
          className="w-8 h-8 text-white"
          aria-hidden="true"
        >
          <path
            fill="currentColor"
            d="M516.9,261.7c-19.8-44.9-65.3-54.5-121-45.2l-17.9-69.4-42.2,10.9,17.6,69.2c-11.1,2.8-22.5,5.2-33.8,8.4l-17.6-68.8-42.2,10.9,17.9,69.4c-9.1,2.6-85.2,22.1-85.2,22.1l11.6,45.2s31-8.7,30.7-8c17.2-4.5,25.3,4.1,29.1,12.2l49.2,190.2c.6,5.5-.4,14.9-12.2,18.1.7.4-30.7,7.9-30.7,7.9l4.6,52.7s75.4-19.3,85.3-21.8l18.1,70.2,42.2-10.9-18.1-70.7c11.6-2.7,22.9-5.5,33.9-8.4l18,70.3,42.2-10.9-18.1-70.1c65-15.8,110.9-56.8,101.5-119.5-6-37.8-47.3-68.8-81.6-72.3,21.1-18.7,31.8-46,18.7-81.7h0ZM496.6,427.2c8.4,62.1-77.9,69.7-106.4,77.2l-24.8-92.9c28.6-7.5,117-39,131.2,15.7ZM444.6,300.7c8.9,55.2-64.9,61.6-88.7,67.7l-22.6-84.3c23.9-5.9,93.2-34.5,111.3,16.6Z"
          />
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

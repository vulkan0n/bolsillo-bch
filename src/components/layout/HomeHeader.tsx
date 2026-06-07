import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { Wallet } from "lucide-react";

import { selectActiveWalletName } from "@/redux/wallet";

export default function HomeHeader() {
  const navigate = useNavigate();
  const walletName = useSelector(selectActiveWalletName);

  const initial = walletName?.trim().charAt(0).toUpperCase() || "B";

  return (
    <header
      className="flex items-center justify-between px-5 pb-3 bg-neutral-25 dark:bg-neutral-1000"
      style={{ paddingTop: "max(env(safe-area-inset-top), 16px)" }}
    >
      <div className="flex items-center">
        <Wallet
          size={24}
          strokeWidth={1.75}
          className="text-brand-600 dark:text-brand-400"
        />
        <span className="ml-2 text-h3 text-brand-600 dark:text-brand-400 font-semibold">
          Bolsillo
        </span>
      </div>
      <button
        type="button"
        onClick={() => navigate("/settings")}
        aria-label="Ajustes"
        className="w-9 h-9 rounded-full bg-brand-500 text-white text-sm font-semibold flex items-center justify-center focus-visible:outline-2 focus-visible:outline-brand-500 focus-visible:outline-offset-2"
      >
        {initial}
      </button>
    </header>
  );
}

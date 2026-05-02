import { useSelector } from "react-redux";
import { NavLink } from "react-router";
import { Home, Receipt, Settings } from "lucide-react";

import { selectKeyboardIsOpen, selectScannerIsScanning } from "@/redux/device";
import { selectIsVendorModeActive } from "@/redux/preferences";

export default function BottomNavigation() {
  const isKeyboardOpen = useSelector(selectKeyboardIsOpen);
  const isScanning = useSelector(selectScannerIsScanning);
  const isVendorModeActive = useSelector(selectIsVendorModeActive);

  if (isKeyboardOpen || isVendorModeActive) {
    return null;
  }

  return (
    <nav
      data-testid="nav-bottom"
      className={`w-full flex items-center justify-around h-16 pb-safe-bottom bg-neutral-0 dark:bg-neutral-800 border-t border-neutral-100 dark:border-neutral-700 z-30 ${isScanning ? "opacity-0" : ""}`}
    >
      <NavTab to="/wallet" icon={Home} label="Inicio" />
      <NavTab to="/wallet/history" icon={Receipt} label="Movimientos" />
      <NavTab to="/settings" icon={Settings} label="Ajustes" />
    </nav>
  );
}

interface NavTabProps {
  to: string;
  icon: React.ComponentType<{
    size?: number;
    strokeWidth?: number;
    className?: string;
  }>;
  label: string;
}

function NavTab({ to, icon, label }: NavTabProps) {
  const Icon = icon;
  return (
    <NavLink
      to={to}
      className="flex-1 flex flex-col items-center justify-center gap-1 h-full"
    >
      {({ isActive }) => (
        <>
          <Icon
            size={24}
            strokeWidth={1.75}
            className={
              isActive
                ? "text-brand-600 dark:text-brand-400"
                : "text-neutral-400 dark:text-neutral-500"
            }
          />
          <span
            className={`text-xs ${isActive ? "text-brand-600 dark:text-brand-400 font-medium" : "text-neutral-400 dark:text-neutral-500"}`}
          >
            {label}
          </span>
        </>
      )}
    </NavLink>
  );
}

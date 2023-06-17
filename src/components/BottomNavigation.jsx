import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  selectKeyboardIsOpen,
  selectScannerIsScanning,
} from "@/redux/device";
import {
  WalletOutlined,
  WalletFilled,
  AppstoreOutlined,
  AppstoreFilled,
  SettingOutlined,
  SettingFilled,
} from "@ant-design/icons";

function BottomNavigation() {
  const keyboardIsOpen = useSelector(selectKeyboardIsOpen);
  const isScanning = useSelector(selectScannerIsScanning);

  return (
    !keyboardIsOpen &&
    !isScanning && (
      <>
        <div className="fixed bottom-0 w-full flex items-center justify-around z-50">
          <NavButton
            to="/wallet"
            activeIcon={WalletFilled}
            icon={WalletOutlined}
            label="Wallet"
          />
          {/*<NavButton
            to="/explore"
            activeIcon={AppstoreFilled}
            icon={AppstoreOutlined}
            label="Explore"
          />*/}
          <NavButton
            to="/settings"
            activeIcon={SettingFilled}
            icon={SettingOutlined}
            label="Settings"
          />
        </div>
      </>
    )
  );
}

function NavButton({ to, icon, activeIcon, label }) {
  const Icon = icon;
  const ActiveIcon = activeIcon;

  const baseClasses = "bg-zinc-900 text-primary border-primary w-full h-16 p-2";
  const activeClasses = "active border-t-4";
  const iconClasses = "text-2xl";

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        isActive ? `${baseClasses} ${activeClasses}` : `${baseClasses}`
      }
    >
      {({ isActive }) => (
        <>
          <div className="text-center">
            {isActive ? (
              <ActiveIcon className={iconClasses} />
            ) : (
              <Icon className={iconClasses} />
            )}
          </div>
          <div className="text-center text-sm">{label}</div>
        </>
      )}
    </NavLink>
  );
}

export default BottomNavigation;

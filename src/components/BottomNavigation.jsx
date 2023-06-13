import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectKeyboardIsOpen } from "@/redux/device";
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

  const baseClasses = "bg-zinc-900 text-primary border-primary";
  const activeClasses = "active border-t-4";
  const iconClasses = "text-2xl";

  return (
    !keyboardIsOpen && (
      <div className="btm-nav btm-nav-md z-50">
        <NavLink
          to="/wallet"
          className={({ isActive }) =>
            isActive ? `${baseClasses} ${activeClasses}` : `${baseClasses}`
          }
        >
          {({ isActive }) => (
            <>
              {isActive ? (
                <WalletFilled className={iconClasses} />
              ) : (
                <WalletOutlined className={iconClasses} />
              )}
              <span className="btm-nav-label">Wallet</span>
            </>
          )}
        </NavLink>
        {/*<NavLink
        to="/explore"
        className={({ isActive }) =>
          isActive ? `${baseClasses} ${activeClasses}` : `${baseClasses}`
        }
      >
        {({ isActive }) => (
          <>
            {isActive ? (
              <AppstoreFilled className={iconClasses} />
            ) : (
              <AppstoreOutlined className={iconClasses} />
            )}
            <span className="btm-nav-label">Explore</span>
          </>
        )}
      </NavLink>*/}
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            isActive ? `${baseClasses} ${activeClasses}` : `${baseClasses}`
          }
        >
          {({ isActive }) => (
            <>
              {isActive ? (
                <SettingFilled className={iconClasses} />
              ) : (
                <SettingOutlined className={iconClasses} />
              )}
              <span className="btm-nav-label">Settings</span>
            </>
          )}
        </NavLink>
      </div>
    )
  );
}

export default BottomNavigation;

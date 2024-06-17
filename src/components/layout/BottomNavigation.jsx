import PropTypes from "prop-types";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  WalletOutlined,
  WalletFilled,
  CompassOutlined,
  CompassFilled,
  SettingOutlined,
  SettingFilled,
} from "@ant-design/icons";

import { selectLanguageCode, selectIsExperimental, selectIsPrerelease } from "@/redux/preferences";
import { selectKeyboardIsOpen, selectScannerIsScanning } from "@/redux/device";
import translations from "./bottomNavigationTranslations";
import { translate } from "@/util/translations";

const { wallet, explore, settings } = translations;

function BottomNavigation() {
  const isKeyboardOpen = useSelector(selectKeyboardIsOpen);
  const isScanning = useSelector(selectScannerIsScanning);
  const isExperimental = useSelector(selectIsExperimental);
  const isPrerelease = useSelector(selectIsPrerelease);

  // Ensure component reloads when language preferences are changed
  useSelector(selectLanguageCode);

  return (
    !isKeyboardOpen &&
    !isScanning && (
      <div
        className="fixed bottom-0 w-full flex items-center justify-around z-50"
        id="bottomNav"
      >
        <NavButton
          to="/wallet"
          activeIcon={WalletFilled}
          icon={WalletOutlined}
          label={translate(wallet)}
        />
        {(isExperimental || isPrerelease) && (
          <NavButton
            to="/explore"
            activeIcon={CompassFilled}
            icon={CompassOutlined}
            label={translate(explore)}
          />
        )}
        <NavButton
          to="/settings"
          activeIcon={SettingFilled}
          icon={SettingOutlined}
          label={translate(settings)}
        />
      </div>
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

NavButton.propTypes = {
  to: PropTypes.string,
  icon: PropTypes.object,
  activeIcon: PropTypes.object,
  label: PropTypes.string,
};

NavButton.defaultProps = {
  to: "",
  icon: null,
  activeIcon: null,
  label: "",
};

export default BottomNavigation;

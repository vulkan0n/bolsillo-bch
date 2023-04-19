import { NavLink } from "react-router-dom";
import {
  HomeOutlined,
  HomeFilled,
  AppstoreOutlined,
  AppstoreFilled,
  SettingOutlined,
  SettingFilled,
} from "@ant-design/icons";

function BottomNavigation() {
  const baseClasses = "bg-zinc-900 text-primary border-primary";
  const activeClasses = "active border-t-4";
  const iconClasses = "text-2xl";

  return (
    <div className="btm-nav btm-nav-sm z-50">
      <NavLink
        to="/wallet"
        className={({ isActive }) =>
          isActive ? `${baseClasses} ${activeClasses}` : `${baseClasses}`
        }
      >
        {({ isActive }) => (
          <span className="btm-nav-label">
            {isActive ? (
              <HomeFilled className={iconClasses} />
            ) : (
              <HomeOutlined className={iconClasses} />
            )}
          </span>
        )}
      </NavLink>
      {/*<NavLink
        to="/explore"
        className={({ isActive }) =>
          isActive ? `${baseClasses} ${activeClasses}` : `${baseClasses}`
        }
      >
        {({ isActive }) => (
          <span className="btm-nav-label">
            {isActive ? (
              <AppstoreFilled className={iconClasses} />
            ) : (
              <AppstoreOutlined className={iconClasses} />
            )}
          </span>
        )}
      </NavLink>*/}
      <NavLink
        to="/settings"
        className={({ isActive }) =>
          isActive ? `${baseClasses} ${activeClasses}` : `${baseClasses}`
        }
      >
        {({ isActive }) => (
          <span className="btm-nav-label">
            {isActive ? (
              <SettingFilled className={iconClasses} />
            ) : (
              <SettingOutlined className={iconClasses} />
            )}
          </span>
        )}
      </NavLink>
    </div>
  );
}

export default BottomNavigation;

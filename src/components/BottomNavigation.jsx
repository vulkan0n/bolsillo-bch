import { NavLink } from "react-router-dom";
import {
  HomeOutlined,
  AppstoreOutlined,
  SettingOutlined,
} from "@ant-design/icons";

function BottomNavigation() {
  const baseClasses = "bg-zinc-900 text-primary border-primary";
  const activeClasses = "active border-t-4";

  return (
    <div className="btm-nav btm-nav-sm z-50">
      <NavLink
        to="/wallet"
        className={({ isActive }) =>
          isActive ? `${baseClasses} ${activeClasses}` : `${baseClasses}`
        }
      >
        <span className="btm-nav-label">
          <HomeOutlined className="text-2xl" />
        </span>
      </NavLink>
      <NavLink
        to="/explore"
        className={({ isActive }) =>
          isActive ? `${baseClasses} ${activeClasses}` : `${baseClasses}`
        }
      >
        <span className="btm-nav-label">
          <AppstoreOutlined className="text-2xl" />
        </span>
      </NavLink>
      <NavLink
        to="/settings"
        className={({ isActive }) =>
          isActive ? `${baseClasses} ${activeClasses}` : `${baseClasses}`
        }
      >
        <span className="btm-nav-label">
          <SettingOutlined className="text-2xl" />
        </span>
      </NavLink>
    </div>
  );
}

export default BottomNavigation;

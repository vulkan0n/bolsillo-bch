import { NavLink } from "react-router-dom";

function BottomNavigation() {
  const baseClasses = "bg-zinc-900 text-primary border-primary";

  return (
    <div className="btm-nav btm-nav-sm z-50">
      <NavLink
        to="/wallet"
        className={({ isActive }) =>
          isActive ? `${baseClasses} active` : `${baseClasses}`
        }
      >
        <span className="btm-nav-label">Wallet</span>
      </NavLink>
      <NavLink
        to="/explore"
        className={({ isActive }) =>
          isActive ? `${baseClasses} active` : `${baseClasses}`
        }
      >
        <span className="btm-nav-label">Explore</span>
      </NavLink>
      <NavLink
        to="/settings"
        className={({ isActive }) =>
          isActive ? `${baseClasses} active` : `${baseClasses}`
        }
      >
        <span className="btm-nav-label">Settings</span>
      </NavLink>
    </div>
  );
}

export default BottomNavigation;

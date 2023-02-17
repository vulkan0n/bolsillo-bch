import { NavLink } from "react-router-dom";

function BottomNavigation() {
  return (
    <div className="btm-nav btm-nav-md">
      <NavLink to="/wallet"
        className={({isActive}) => isActive ? "text-primary active" : ""}
      >
        <span className="btm-nav-label">Wallet</span>
      </NavLink>
      <NavLink to="/community"
        className={({isActive}) => isActive ? "text-primary active" : ""}
      >
        <span className="btm-nav-label">Community</span>
      </NavLink>
      <NavLink to="/settings"
        className={({isActive}) => isActive ? "text-primary active" : ""}
      >
        <span className="btm-nav-label">Settings</span>
      </NavLink>
    </div>
  );
}

export default BottomNavigation;

import { NavLink } from "react-router-dom";

function BottomNavigation() {
  return (
    <div className="btm-nav btm-nav-sm">
      <NavLink to="/wallet">
        <span className="btm-nav-label">Wallet</span>
      </NavLink>
      <NavLink to="/community">
        <span className="btm-nav-label">Community</span>
      </NavLink>
      <NavLink to="/settings">
        <span className="btm-nav-label">Settings</span>
      </NavLink>
    </div>
  );
}

export default BottomNavigation;

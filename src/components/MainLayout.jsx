import { Outlet, Link } from "react-router-dom";

function MainLayout() {
  return (
    <div className="App">
      <Outlet />
      <div>
          <Link to="/wallet">Wallet</Link>
          <Link to="/community">Community</Link>
          <Link to="/settings">Settings</Link>
      </div>
    </div>
  );
}

export default MainLayout;

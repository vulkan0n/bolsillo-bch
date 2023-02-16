import { NavLink } from "react-router-dom";

function WalletViewTabs() {
  const baseTabClass = "tab tab-lg tab-bordered flex-1";
  const activeTabClass = "text-primary border-current";
  const inactiveTabClass = "text-zinc-500";

  return (
    <div className="tabs bg-zinc-300">
      <NavLink
        to="send"
        className={({ isActive }) =>
          isActive ? `${baseTabClass} ${activeTabClass}` : `${baseTabClass} ${inactiveTabClass}`
        }
      >
        Send
      </NavLink>
      <NavLink
        to=""
        className={({ isActive }) =>
          isActive ? `${baseTabClass} ${activeTabClass}` : `${baseTabClass} ${inactiveTabClass}`
        }
        end
      >
        Receive
      </NavLink>
    </div>
  );
}

export default WalletViewTabs;

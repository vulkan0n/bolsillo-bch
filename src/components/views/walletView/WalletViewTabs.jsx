import { NavLink } from "react-router-dom";

function WalletViewTabs() {
  const baseTabClass = "tab tab-lg tab-bordered flex-1";
  const activeTabClass = "text-secondary border-secondary border-b-2";
  const inactiveTabClass = "text-zinc-500";

  return (
    <div className="tabs bg-zinc-200">
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

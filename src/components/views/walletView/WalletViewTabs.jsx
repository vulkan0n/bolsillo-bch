import { NavLink } from "react-router-dom";
import { SendOutlined, QrcodeOutlined } from "@ant-design/icons";

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
        <SendOutlined className="text-xl px-1" />&nbsp;Send
      </NavLink>
      <NavLink
        to=""
        className={({ isActive }) =>
          isActive ? `${baseTabClass} ${activeTabClass}` : `${baseTabClass} ${inactiveTabClass}`
        }
        end
      >
        <QrcodeOutlined className="text-xl px-1" />&nbsp;Receive
      </NavLink>
    </div>
  );
}

export default WalletViewTabs;

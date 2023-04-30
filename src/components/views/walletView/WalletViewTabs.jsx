import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectTransactionHistory } from "@/redux/transactions";
import { selectScannerIsScanning } from "@/redux/device";
import { SendOutlined, QrcodeOutlined } from "@ant-design/icons";

export default function WalletViewTabs() {
  const baseTabClass = "tab tab-lg tab-bordered flex-1";
  const activeTabClass = "text-secondary border-secondary border-b-2";
  const inactiveTabClass = "text-zinc-500";

  const isScanning = useSelector(selectScannerIsScanning);
  const txHistory = useSelector(selectTransactionHistory);

  return isScanning ? null : (
    <div className="tabs bg-zinc-200">
      {txHistory.length > 0 && (
        <NavLink
          to="send"
          className={({ isActive }) =>
            isActive
              ? `${baseTabClass} ${activeTabClass}`
              : `${baseTabClass} ${inactiveTabClass}`
          }
        >
          <SendOutlined className="text-xl px-1" />
          &nbsp;Send
        </NavLink>
      )}
      <NavLink
        to=""
        className={({ isActive }) =>
          isActive && !isScanning
            ? `${baseTabClass} ${activeTabClass}`
            : `${baseTabClass} ${inactiveTabClass}`
        }
        end
      >
        <QrcodeOutlined className="text-xl px-1" />
        &nbsp;Receive {txHistory.length < 1 && "Bitcoin Cash (BCH)"}
      </NavLink>
    </div>
  );
}

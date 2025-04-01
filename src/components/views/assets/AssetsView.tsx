import { useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router";
import { useDispatch } from "react-redux";
import {
  BankOutlined,
  MoneyCollectOutlined,
  DeploymentUnitOutlined,
} from "@ant-design/icons";
import { setPreference } from "@/redux/preferences";

import ViewHeader from "@/layout/ViewHeader";
import FullColumn from "@/layout/FullColumn";

export default function AssetsView() {
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(
    function updateLastAssetsPath() {
      const pathSplit = location.pathname.split("/");
      if (pathSplit.length > 2) {
        const path = pathSplit.slice(0, 3).join("/");
        dispatch(
          setPreference({
            key: "lastAssetsPath",
            value: path,
          })
        );
      }
    },
    [location, dispatch]
  );

  return (
    <FullColumn>
      <ViewHeader icon={BankOutlined} title="Assets" />
      <FullColumn>
        <div className="flex">
          <NavTab
            to="/assets/tokens"
            label="Tokens"
            icon={DeploymentUnitOutlined}
            activeIcon={DeploymentUnitOutlined}
          />
          <NavTab
            to="/assets/coins"
            label="Coins"
            icon={MoneyCollectOutlined}
            activeIcon={MoneyCollectOutlined}
          />
        </div>
        <Outlet />
      </FullColumn>
    </FullColumn>
  );
}

interface NavTabProps {
  to: string;
  icon: React.ComponentType;
  activeIcon: React.ComponentType;
  label: string;
}

function NavTab({
  to = "",
  icon = () => null,
  activeIcon = () => null,
  label = "",
}: NavTabProps) {
  const Icon = icon;
  const ActiveIcon = activeIcon;

  const baseClasses = "bg-zinc-800 text-primary border-primary w-full p-2";
  const activeClasses = "active border-b-4 font-semibold shadow-inner";
  const iconClasses = "text-lg mr-1";

  return (
    <NavLink
      to={to}
      replace
      className={({ isActive }) =>
        isActive ? `${baseClasses} ${activeClasses}` : `${baseClasses}`
      }
    >
      {({ isActive }) => (
        <div className="flex items-center justify-center text-sm">
          {isActive ? (
            <ActiveIcon className={iconClasses} />
          ) : (
            <Icon className={iconClasses} />
          )}
          <span>{label}</span>
        </div>
      )}
    </NavLink>
  );
}

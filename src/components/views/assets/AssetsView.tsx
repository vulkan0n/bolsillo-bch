import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, NavLink, Outlet, useLocation } from "react-router";
import {
  BankOutlined,
  MoneyCollectOutlined,
  DeploymentUnitOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { setPreference } from "@/redux/preferences";
import { selectActiveWallet } from "@/redux/wallet";

import ViewHeader from "@/layout/ViewHeader";
import FullColumn from "@/layout/FullColumn";

import { translate } from "@/util/translations";
import translations from "./translations";

function AssetsViewAccessory() {
  return (
    <Link to="/settings" className="flex items-center justify-center">
      <SettingOutlined className="text-2xl ml-2" />
    </Link>
  );
}

export default function AssetsView() {
  const dispatch = useDispatch();
  const location = useLocation();

  const wallet = useSelector(selectActiveWallet);

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
      <ViewHeader
        icon={BankOutlined}
        title={translate(translations.assets)}
        accessory={AssetsViewAccessory}
      />
      <FullColumn>
        <div className="flex">
          <NavTab
            to="/assets/tokens"
            label={translate(translations.tokens)}
            icon={DeploymentUnitOutlined}
            activeIcon={DeploymentUnitOutlined}
          />
          <NavTab
            to="/assets/coins"
            label={translate(translations.coins)}
            icon={MoneyCollectOutlined}
            activeIcon={MoneyCollectOutlined}
          />
        </div>
        <Outlet context={wallet} />
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

function NavTab({ to, icon, activeIcon, label }: NavTabProps) {
  const Icon = icon;
  const ActiveIcon = activeIcon;

  const baseClasses = "bg-neutral-800 text-primary border-primary w-full p-2";
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

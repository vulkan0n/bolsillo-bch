import { NavLink, Outlet } from "react-router";
import {
  BankOutlined,
  OrderedListOutlined,
  MoneyCollectOutlined,
  DeploymentUnitOutlined,
  GroupOutlined,
} from "@ant-design/icons";
import { useSelector } from "react-redux";

import { selectIsExperimental } from "@/redux/preferences";

import ViewHeader from "@/layout/ViewHeader";

export default function AssetsView() {
  const isExperimental = useSelector(selectIsExperimental);
  return (
    <>
      <ViewHeader icon={BankOutlined} title="Assets" />
      <div className="flex">
        <NavTab
          to="/assets/addresses"
          label="Addresses"
          icon={OrderedListOutlined}
          activeIcon={OrderedListOutlined}
        />
        <NavTab
          to="/assets/coins"
          label="Coins"
          icon={MoneyCollectOutlined}
          activeIcon={MoneyCollectOutlined}
        />
        {isExperimental && (
          <>
            <NavTab
              to="/assets/tokens"
              label="Tokens"
              icon={DeploymentUnitOutlined}
              activeIcon={DeploymentUnitOutlined}
            />
            <NavTab
              to="/assets/collections"
              label="Collections"
              icon={GroupOutlined}
              activeIcon={GroupOutlined}
            />
          </>
        )}
      </div>
      <Outlet />
    </>
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
  const activeClasses = "active border-b-4";
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

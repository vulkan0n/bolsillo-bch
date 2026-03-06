import { Navigate } from "react-router";
import { useSelector } from "react-redux";

import { selectIsVendorModeActive } from "@/redux/preferences";

export default function IndexRoute() {
  const isVendorModeActive = useSelector(selectIsVendorModeActive);

  if (isVendorModeActive) {
    return <Navigate to="/vendor" replace />;
  }

  return <Navigate to="/wallet" replace />;
}

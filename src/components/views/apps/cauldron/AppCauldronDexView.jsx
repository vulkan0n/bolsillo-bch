import { useState, useMemo } from "react";
import { useLocation } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import {
  CloseOutlined,
  CopyOutlined,
  ExperimentOutlined,
} from "@ant-design/icons";
import { selectActiveWalletHash } from "@/redux/wallet";
import FullColumn from "@/layout/FullColumn";
import ViewHeader from "@/layout/ViewHeader";
import Button from "@/atoms/Button";
import Address from "@/atoms/Address";

import { useClipboard } from "@/hooks/useClipboard";

import WalletConnectService from "@/services/WalletConnectService";
import AddressManagerService from "@/services/AddressManagerService";
import LogService from "@/services/LogService";

const Log = LogService("AppCauldronDexView");

export default function AppCauldronDexView() {
  const dispatch = useDispatch();
  const location = useLocation();

  const walletHash = useSelector(selectActiveWalletHash);

  return (
    <FullColumn>
      <ViewHeader title="Cauldron DEX" icon={ExperimentOutlined} />
      <div className="p-1">
      </div>
    </FullColumn>
  );
}

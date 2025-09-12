import { useState, useMemo } from "react";
import { useLocation } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import {
  CloseOutlined,
  CopyOutlined,
  ExperimentOutlined,
  TransactionOutlined,
} from "@ant-design/icons";
import { selectActiveWalletHash } from "@/redux/wallet";
import FullColumn from "@/layout/FullColumn";
import ViewHeader from "@/layout/ViewHeader";
import Button from "@/atoms/Button";
import Card from "@/atoms/Card";
import { SatoshiInput } from "@/atoms/SatoshiInput";

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
      <div className="p-4">
        <Card>
          <div className="flex flex-col justify-center p-2">
            <div>
              <div className="text-neutral-500">You pay</div>
              <SatoshiInput className="text-3xl my-1 p-2 rounded w-full border border-primary-700 shadow-inner" />
            </div>
            <div className="">
              <Button icon={TransactionOutlined} padding="2" rounded="md" />
            </div>
            <div>
              <div className="text-neutral-500">You receive</div>
              <SatoshiInput className="text-3xl my-1 p-2 rounded w-full border border-primary-700 shadow-inner" />
            </div>
          </div>
        </Card>
        <div className="my-2">
          <Button label="Swap" fullWidth rounded="lg" inverted labelSize="xl"/>
        </div>
      </div>
    </FullColumn>
  );
}

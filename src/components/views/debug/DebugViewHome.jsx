import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Dialog } from "@capacitor/dialog";
import {
  ExceptionOutlined,
  UnlockOutlined,
  ClearOutlined,
  ExportOutlined,
  FireOutlined,
} from "@ant-design/icons";
import { selectSecuritySettings } from "@/redux/preferences";
import Button from "@/atoms/Button";

import LogService from "@/kernel/app/LogService";
import SecurityService, { AuthActions } from "@/kernel/app/SecurityService";
import JanitorService from "@/kernel/app/JanitorService";
import ConsoleService from "@/kernel/app/ConsoleService";
import BcmrService from "@/kernel/bch/BcmrService";

import { translate } from "@/util/translations";
import translations from "./translations";

import DebugSettings from "./DebugSettings";
import DebugConsole from "./DebugConsole";

const Log = LogService("DebugViewHome");

export default function DebugView() {
  const { authMode, authActions } = useSelector(selectSecuritySettings);

  const [shouldThrowFakeError, setShouldThrowFakeError] = useState(false);

  // throw the fake error in an effect so that it's caught by the react-router error boundary
  useEffect(
    function throwFakeErrorOnRender() {
      if (shouldThrowFakeError) {
        setShouldThrowFakeError(false);
        throw new Error("all ur base are belong to us");
      }
    },
    [shouldThrowFakeError]
  );

  const handleThrowFakeError = () => {
    setShouldThrowFakeError(true);
  };

  const handleExportLogs = async () => {
    await ConsoleService().exportLogs();
  };

  const handleAuthorize = async () => {
    const isAuthorized = await SecurityService().authorize(AuthActions.Debug);
    Log.log("SecurityService authorize", isAuthorized);
    Dialog.alert({
      title: "SecurityService",
      message: `Security mode: ${authMode}\nisAuthorized ${isAuthorized}\nauthActions ${authActions.join(";")}`,
    });
  };

  const handlePurgeData = async () => {
    await JanitorService().purgeStaleData();
  };

  const handlePurgeBcmr = async () => {
    await BcmrService().purgeBcmrData();
  };

  const handleExportBcmr = async () => {
    await BcmrService().exportLocalBcmr();
  };

  const handleResetDatabases = async () => {
    await JanitorService().resetDatabases();
  };

  return (
    <div className="p-1">
      <DebugSettings />
      <DebugConsole />
      <div className="m-1">
        <div className="flex flex-wrap">
          <Button
            icon={ExportOutlined}
            label={translate(translations.exportLogs)}
            onClick={handleExportLogs}
          />
          <Button
            icon={ExportOutlined}
            label="Export BCMR Data"
            onClick={handleExportBcmr}
          />
          <Button
            icon={UnlockOutlined}
            label="AuthAction"
            onClick={handleAuthorize}
          />
          <Button
            icon={ExceptionOutlined}
            label={translate(translations.throwAnError)}
            onClick={handleThrowFakeError}
          />
          <Button
            icon={ClearOutlined}
            label="Purge Stale Data"
            onClick={handlePurgeData}
          />
          <Button
            icon={ClearOutlined}
            label="Purge BCMR Data"
            onClick={handlePurgeBcmr}
          />
          <Button
            icon={FireOutlined}
            label="Reset Databases"
            borderClasses="border border-2 border-error"
            activeBgColor="error"
            onClick={handleResetDatabases}
          />
        </div>
      </div>
    </div>
  );
}

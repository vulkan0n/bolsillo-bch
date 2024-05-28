import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  BugOutlined,
  ExperimentOutlined,
  ExceptionOutlined,
  RocketOutlined,
  ForkOutlined,
  CodeOutlined,
  ExportOutlined,
} from "@ant-design/icons";
import {
  setPreference,
  selectIsChipnet,
  selectIsExperimental,
  selectIsPrerelease,
  selectIsDeveloper,
} from "@/redux/preferences";
import ViewHeader from "@/layout/ViewHeader";
import Accordion from "@/atoms/Accordion";
import Button from "@/atoms/Button";
import { translate } from "@/util/translations";
import translations from "./DebugViewTranslations";

import ConsoleService from "@/services/ConsoleService";

export default function DebugView() {
  const Console = ConsoleService();

  const dispatch = useDispatch();

  const isChipnet = useSelector(selectIsChipnet);
  const isExperimental = useSelector(selectIsExperimental);
  const isPrerelease = useSelector(selectIsPrerelease);
  const isDeveloper = useSelector(selectIsDeveloper);

  const handleIsChipnet = (event) => {
    const newNetwork = event.target.checked ? "chipnet" : "mainnet";
    dispatch(setPreference({ key: "bchNetwork", value: newNetwork }));
    window.location.assign("/");
  };

  const handleIsExperimental = (event) => {
    const value = event.target.checked ? "true" : "false";
    dispatch(setPreference({ key: "enableExperimental", value }));
  };

  const handleIsPrerelease = (event) => {
    const value = event.target.checked ? "true" : "false";
    dispatch(setPreference({ key: "enablePrerelease", value }));
  };

  const handleIsDeveloper = (event) => {
    const value = event.target.checked ? "true" : "false";
    dispatch(setPreference({ key: "developer", value }));
  };

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
    await Console.exportLogs();
  };

  return (
    <>
      <ViewHeader icon={BugOutlined} title={translate(translations.debug)} />
      <div className="p-2">
        <Accordion
          icon={BugOutlined}
          title={translate(translations.debugOptions)}
        >
          <Accordion.Child icon={ExperimentOutlined} label="Use Chipnet">
            <input
              type="checkbox"
              checked={isChipnet}
              onChange={handleIsChipnet}
            />
          </Accordion.Child>
          <Accordion.Child
            icon={RocketOutlined}
            label={translate(translations.enableExperimentalFeatures)}
            description={translate(translations.experimentalDescription)}
          >
            <input
              type="checkbox"
              checked={isExperimental}
              onChange={handleIsExperimental}
            />
          </Accordion.Child>
          <Accordion.Child
            icon={ForkOutlined}
            label={translate(translations.enablePrereleaseFeatures)}
            description={translate(translations.prereleaseDescription)}
          >
            <div>
              <input
                type="checkbox"
                checked={isPrerelease}
                onChange={handleIsPrerelease}
              />
            </div>
            {/* {translate(translations.translations.derivationPathExplanation)}{" "} */}
          </Accordion.Child>
          {isExperimental ? (
            <Accordion.Child icon={CodeOutlined} label="Developer Mode">
              <input
                type="checkbox"
                checked={isDeveloper}
                onChange={handleIsDeveloper}
              />
            </Accordion.Child>
          ) : null}
        </Accordion>
        <div className="p-1 font-mono h-[50vh] overflow-y-auto border border-black rounded text-wrap break-words">
          <ul className="h-full list-disc list-inside">
            {Console.getLines().map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          .
        </div>
        <div className="m-1">
          <div className="flex">
            <Button
              icon={ThrowAnErrorButtonIcon}
              label=""
              onClick={handleThrowFakeError}
            />
            <Button
              icon={ExportLogsButtonIcon}
              label=""
              onClick={handleExportLogs}
            />
          </div>
        </div>
      </div>
    </>
  );
}

function ThrowAnErrorButtonIcon() {
  return (
    <span className="flex justify-center items-center">
      <ExceptionOutlined className="mr-1" />
      {translate(translations.throwAnError)}
    </span>
  );
}

function ExportLogsButtonIcon() {
  return (
    <span className="flex justify-center items-center">
      <ExportOutlined className="mr-1" />
      Export Logs
    </span>
  );
}

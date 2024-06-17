import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  BugOutlined,
  ExperimentOutlined,
  ExceptionOutlined,
  RocketOutlined,
  ForkOutlined,
} from "@ant-design/icons";
import {
  setPreference,
  selectIsChipnet,
  selectIsExperimental,
  selectIsPrerelease,
} from "@/redux/preferences";
import ViewHeader from "@/layout/ViewHeader";
import Accordion from "@/atoms/Accordion";
import Button from "@/atoms/Button";

export default function DebugView() {
  const dispatch = useDispatch();

  const isChipnet = useSelector(selectIsChipnet);
  const isExperimental = useSelector(selectIsExperimental);
  const isPrerelease = useSelector(selectIsPrerelease);

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

  return (
    <>
      <ViewHeader icon={BugOutlined} title="Debug" />
      <div className="p-2">
        <Accordion icon={BugOutlined} title="Debug Options">
          <Accordion.Child icon={ExperimentOutlined} label="Use Chipnet">
            <input
              type="checkbox"
              checked={isChipnet}
              onChange={handleIsChipnet}
            />
          </Accordion.Child>
          <Accordion.Child
            icon={RocketOutlined}
            label="Enable Experimental Features"
            description="Unstable features undergoing development. Intended for developers & internal testers only. Use extreme caution!!"
          >
            <input
              type="checkbox"
              checked={isExperimental}
              onChange={handleIsExperimental}
            />
          </Accordion.Child>
          <Accordion.Child
            icon={ForkOutlined}
            label="Enable Pre-release Features"
            description="Stable features planned for upcoming release. Advanced users may trial before release, with appropriate caution & expectation of bugs."
          >
            <div>
              <input
                type="checkbox"
                checked={isPrerelease}
                onChange={handleIsPrerelease}
              />
            </div>
            {/* {translate(translations.derivationPathExplanation)}{" "} */}
          </Accordion.Child>
        </Accordion>
        <div className="m-1">
          <div className="flex">
            <Button
              icon={ThrowAnErrorButtonIcon}
              label=""
              onClick={handleThrowFakeError}
            />
          </div>
        </div>
      </div>
    </>
  );
}

function ThrowAnErrorButtonIcon() {
  return (
    <span>
      <ExceptionOutlined className="mr-1" />
      Throw an Error
    </span>
  );
}

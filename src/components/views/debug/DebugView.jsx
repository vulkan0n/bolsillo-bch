import { useDispatch, useSelector } from "react-redux";
import { BugOutlined, ExperimentOutlined } from "@ant-design/icons";
import { setPreference, selectIsChipnet } from "@/redux/preferences";
import ViewHeader from "@/layout/ViewHeader";
import Accordion from "@/atoms/Accordion";

export default function DebugView() {
  const dispatch = useDispatch();
  const isChipnet = useSelector(selectIsChipnet);

  const handleIsChipnet = (event) => {
    const newNetwork = event.target.checked ? "chipnet" : "mainnet";
    dispatch(setPreference({ key: "bchNetwork", value: newNetwork }));
    window.location.assign("/");
  };

  return (
    <>
      <ViewHeader icon={BugOutlined} title="Debug" />
      <div className="p-2">
        <Accordion icon={BugOutlined} title="Debug Options">
          <Accordion.Child icon={ExperimentOutlined} label="Chipnet">
            <input
              type="checkbox"
              checked={isChipnet}
              onChange={handleIsChipnet}
            />
          </Accordion.Child>
        </Accordion>
      </div>
    </>
  );
}

import { BugOutlined } from "@ant-design/icons";
import ViewHeader from "@/layout/ViewHeader";

export default function DebugView() {
  return (
    <>
      <ViewHeader icon={BugOutlined} title="Debug" />
      <div>DebugView</div>
    </>
  );
}

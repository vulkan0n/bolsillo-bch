import { WarningFilled } from "@ant-design/icons";

export default function KeyWarning() {
  return (
    <div className="m-2 p-2">
      <div className="alert alert-warning p-4 shadow-lg bg-warning text-black rounded-lg text-center">
        <div>
          <WarningFilled className="text-error text-4xl" />
          <span className="text-xl">
            YOU HAVE NOT BACKED UP YOUR PRIVATE KEY
          </span>
        </div>
      </div>
    </div>
  );
}

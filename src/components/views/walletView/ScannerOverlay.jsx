import { QrcodeOutlined } from "@ant-design/icons";

export default function ScannerOverlay() {
  return (
    <div className="fixed top-0 w-full h-screen flex items-center justify-center bg-transparent">
      <div
        className="w-80 h-80 rounded-xl flex items-center justify-center border border-4 border-primary opacity-90 mb-32"
        style={{ boxShadow: "0 0 0 100vh #000000" }}
      >
        <QrcodeOutlined
          className="text-4xl opacity-80 text-primary border-2 border-primary rounded-sm"
          style={{ filter: "drop-shadow(0 0 4px #8dc351)" }}
        />
      </div>
    </div>
  );
}

import { QrcodeOutlined } from "@ant-design/icons";

export default function ScannerOverlay() {
  return (
    <div className="fixed top-0 w-full h-screen bg-black opacity-80 flex items-center justify-center">
      <div className="bg-white opacity-70 w-56 h-56 rounded-xl flex items-center justify-center outline outline-4 outline-primary">
        <QrcodeOutlined className="text-4xl opacity-80 text-primary border-2 border-primary rounded-sm" />
      </div>
    </div>
  );
}

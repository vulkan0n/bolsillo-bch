import { ImportOutlined } from "@ant-design/icons";
import ViewHeader from "@/components/views/ViewHeader";
import WalletService from "@/services/WalletService";

export default function SettingsWalletImport() {
  return (
    <>
      <div className="text-2xl text-center text-neutral-900">
        Enter your Recovery Phrase
      </div>
      <div className="flex justify-center">
        <ul className="list-disc p-2 text-left text-neutral-700">
          <li>May also be known as a 'seed phrase'</li>
          <li>Generally 12 or 24 words long</li>
        </ul>
      </div>
      <div className="rounded-md border-4 border-primary">
        <textarea className="w-full text-mono h-36 max-h-36 resize-none"></textarea>
      </div>
    </>
  );
}

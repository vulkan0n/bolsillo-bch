import { useSelector } from "react-redux";
import { selectActiveWallet } from "@/redux/wallet";

export default function AssetsViewCoins() {
  const wallet = useSelector(selectActiveWallet);

  return (
    <div className="p-1">
      <span>AssetsViewCoins</span>
    </div>
  );
}

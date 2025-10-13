/* eslint-disable */
import LogService from "@/services/LogService";
import { WalletEntity } from "@/services/WalletManagerService";
import CauldronService from "@/services/CauldronService";
import TransactionBuilderService from "@/services/TransactionBuilderService";
import TransactionManagerService from "@/services/TransactionManagerService";

const Log = LogService("StablecoinService");

export default function StablecoinService(wallet: WalletEntity) {
  const Cauldron = CauldronService();

  return {
    swapIncoming,
    swapOutgoing,
  };

  async function swapIncoming(amount) {
    await Cauldron.connect();

    return amount;
  }

  async function swapOutgoing(amount) {
    await Cauldron.connect();

    return amount;
  }
}

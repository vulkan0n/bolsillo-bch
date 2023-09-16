import { useSelector } from "react-redux";
import { selectActiveWallet } from "@/redux/wallet";
import { selectCurrencySettings } from "@/redux/preferences";
import AddressManagerService from "@/services/AddressManagerService";
import Address from "@/atoms/Address";
import { formatSatoshis } from "@/util/sats";

export default function WalletAssetsView() {
  const wallet = useSelector(selectActiveWallet);
  const { shouldPreferLocalCurrency } = useSelector(selectCurrencySettings);

  const AddressManager = new AddressManagerService(wallet.id);
  const receiveAddresses = AddressManager.getReceiveAddresses();
  const changeAddresses = AddressManager.getChangeAddresses();

  return (
    <div className="p-2">
      <div className="bg-zinc-200 rounded my-1 p-1">
        <h2 className="text-xl font-bold">Receive Addresses</h2>
        <ul className="bg-zinc-100 text-zinc-600 divide-y divide-zinc-300 rounded-b px-2 max-h-[58vh] overflow-y-scroll border border-zinc-400 shadow-inner">
          {receiveAddresses.map((a, i) => (
            <li key={a.address} className="flex px-1 py-2">
              <div
                className="flex-1 text-sm"
                onClick={() => null /*console.log(tx.time, new Date(tx.time))*/}
              >
                <span className="font-mono text-xs mr-1">#{a.hd_index}</span>
                <Address address={a.address} short />
              </div>
              <div className="flex-1 text-right">
                <div className="font-mono">
                  {
                    formatSatoshis(a.balance)[
                      shouldPreferLocalCurrency ? "fiat" : "bch"
                    ]
                  }
                </div>
                <div className="text-sm opacity-80">
                  {
                    formatSatoshis(a.balance)[
                      shouldPreferLocalCurrency ? "bch" : "fiat"
                    ]
                  }
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="bg-zinc-200 rounded my-1 p-1">
        <h2 className="text-xl font-bold">Change Addresses</h2>
        <ul className="bg-zinc-100 text-zinc-600 divide-y divide-zinc-300 rounded-b px-2 max-h-[58vh] overflow-y-scroll border border-zinc-400 shadow-inner">
          {changeAddresses.map((a, i) => (
            <li key={a.address} className="flex px-1 py-2">
              <div
                className="flex-1 text-sm"
                onClick={() => null /*console.log(tx.time, new Date(tx.time))*/}
              >
                <span className="font-mono text-xs mr-1">#{a.hd_index}</span>
                <Address address={a.address} short />
              </div>
              <div className="flex-1 text-right">
                <div className="font-mono">
                  {
                    formatSatoshis(a.balance)[
                      shouldPreferLocalCurrency ? "fiat" : "bch"
                    ]
                  }
                </div>
                <div className="text-sm opacity-80">
                  {
                    formatSatoshis(a.balance)[
                      shouldPreferLocalCurrency ? "bch" : "fiat"
                    ]
                  }
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

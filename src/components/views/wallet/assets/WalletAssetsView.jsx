import PropTypes from "prop-types";
import { useState } from "react";
import { useSelector } from "react-redux";
import { BankOutlined, MoneyCollectOutlined } from "@ant-design/icons";
import { selectActiveWallet } from "@/redux/wallet";
import { selectCurrencySettings } from "@/redux/preferences";
import AddressManagerService from "@/services/AddressManagerService";
import UtxoManagerService from "@/services/UtxoManagerService";
import Address from "@/atoms/Address";
import { formatSatoshis } from "@/util/sats";
import ViewHeader from "@/layout/ViewHeader";

export default function WalletAssetsView() {
  const wallet = useSelector(selectActiveWallet);

  const AddressManager = new AddressManagerService(wallet.id);
  const receiveAddresses = AddressManager.getReceiveAddresses();
  const changeAddresses = AddressManager.getChangeAddresses();

  return (
    <>
      <ViewHeader icon={BankOutlined} title="Assets" />
      <div className="p-2">
        {/*<div className="my-1 flex justify-evenly">
          <Link to="/wallet/assets/addresses">Addresses</Link>
          <Link to="/wallet/assets/coins">Coins</Link>
          <Link to="/wallet/assets/tokens">Tokens</Link>
        </div>*/}
        <div className="bg-zinc-200 rounded my-1 p-2">
          <h2 className="text-xl font-bold mb-2">Coins</h2>
          <CoinsBlock />
        </div>
        <div className="bg-zinc-200 rounded my-1 p-2">
          <h2 className="text-xl font-bold mb-2">Receive Addresses</h2>
          <AddressBlock addresses={receiveAddresses} />
        </div>
        <div className="bg-zinc-200 rounded my-1 p-2">
          <h2 className="text-xl font-bold">Change Addresses</h2>
          <AddressBlock addresses={changeAddresses} />
        </div>
      </div>
    </>
  );
}

function CoinsBlock() {
  const wallet = useSelector(selectActiveWallet);
  const { shouldPreferLocalCurrency } = useSelector(selectCurrencySettings);

  const UtxoManager = new UtxoManagerService(wallet.id);
  const coins = UtxoManager.getWalletUtxos();

  return (
    <div className="flex flex-wrap gap-1">
      {coins.map((coin) => (
        <div className="border rounded border-primary bg-zinc-50 text-zinc-900 p-1.5 text-sm">
          <div className="flex items-center">
            <div className="text-base mr-1">
              <MoneyCollectOutlined />
            </div>
            <div>
              <div className="font-mono">
                {
                  formatSatoshis(coin.amount)[
                    shouldPreferLocalCurrency ? "fiat" : "bch"
                  ]
                }
              </div>
              <div className="text-sm opacity-80">
                {
                  formatSatoshis(coin.amount)[
                    shouldPreferLocalCurrency ? "bch" : "fiat"
                  ]
                }
              </div>
              <div className="text-xs">
                <Address address={coin.address} short />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function AddressBlock() {
  const { shouldPreferLocalCurrency } = useSelector(selectCurrencySettings);
  const [shouldHideEmptyAddresses, setShouldHideEmptyAddresses] =
    useState(true);

  const AddressManager = new AddressManagerService();
  const addresses = [];

  return (
    <>
      <div className="my-1">
        <div className="flex">
          <input
            type="checkbox"
            checked={shouldHideEmptyAddresses}
            onChange={(event) =>
              setShouldHideEmptyAddresses(event.target.checked)
            }
          />
          <span className="ml-1">Hide Empty Addresses</span>
        </div>
      </div>
      <ul className="bg-zinc-100 text-zinc-600 divide-y divide-zinc-300 rounded-sm px-2 max-h-[58vh] overflow-y-scroll border border-zinc-400 shadow-inner">
        {addresses
          .filter((a) => a.balance > 0 || !shouldHideEmptyAddresses)
          .map((a) => (
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
    </>
  );
}

AddressBlock.propTypes = {
  addresses: PropTypes.array.isRequired,
};

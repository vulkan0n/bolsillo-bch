import PropTypes from "prop-types";
import { useState } from "react";
import { useSelector } from "react-redux";
import { BankOutlined } from "@ant-design/icons";
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

  const UtxoManager = new UtxoManagerService(wallet.id);
  const coins = UtxoManager.getWalletUtxos();

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
          <CoinsBlock coins={coins} />
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

function CoinsBlock({ coins }) {
  const { shouldPreferLocalCurrency } = useSelector(selectCurrencySettings);

  return (
    <ul className="bg-zinc-100 text-zinc-600 divide-y divide-zinc-300 rounded-sm px-2 max-h-[58vh] overflow-y-scroll border border-zinc-400 shadow-inner">
      {coins.map((a) => (
        <li key={`${a.txid}:${a.tx_pos}`} className="flex px-1 py-2">
          <div
            className="flex-1 text-sm"
            onClick={() => null /*console.log(tx.time, new Date(tx.time))*/}
          >
            <Address address={a.address} short />
          </div>
          <div className="flex-1 text-right">
            <div className="font-mono">
              {
                formatSatoshis(a.amount)[
                  shouldPreferLocalCurrency ? "fiat" : "bch"
                ]
              }
            </div>
            <div className="text-sm opacity-80">
              {
                formatSatoshis(a.amount)[
                  shouldPreferLocalCurrency ? "bch" : "fiat"
                ]
              }
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

CoinsBlock.propTypes = {
  coins: PropTypes.array.isRequired,
};

function AddressBlock({ addresses }) {
  const { shouldPreferLocalCurrency } = useSelector(selectCurrencySettings);
  const [shouldHideEmptyAddresses, setShouldHideEmptyAddresses] =
    useState(true);

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

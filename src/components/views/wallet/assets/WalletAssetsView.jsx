import PropTypes from "prop-types";
import { useState } from "react";
import { useSelector } from "react-redux";
import { BankOutlined, MoneyCollectOutlined } from "@ant-design/icons";
import { selectActiveWallet } from "@/redux/wallet";
import { selectCurrencySettings } from "@/redux/preferences";
import AddressManagerService from "@/services/AddressManagerService";
import UtxoManagerService from "@/services/UtxoManagerService";
import Address from "@/atoms/Address";
import Satoshi from "@/atoms/Satoshi";
import ViewHeader from "@/layout/ViewHeader";

export default function WalletAssetsView() {
  const wallet = useSelector(selectActiveWallet);

  const [shouldShowEmptyAddresses, setShouldShowEmptyAddresses] =
    useState(false);

  const AddressManager = AddressManagerService(wallet);
  const receiveAddresses = AddressManager.getReceiveAddresses();
  const changeAddresses = AddressManager.getChangeAddresses();

  const addresses = [...receiveAddresses, ...changeAddresses];

  return (
    <>
      <ViewHeader icon={BankOutlined} title="Assets" />
      <div className="p-1">
        <div className="flex">
          <label className="text-sm">
            <input
              className="mr-1"
              type="checkbox"
              checked={shouldShowEmptyAddresses}
              onChange={(event) =>
                setShouldShowEmptyAddresses(event.target.checked)
              }
            />
            Show Empty Addresses
          </label>
        </div>
        <ul className="mt-2 bg-zinc-100 text-zinc-600 divide-y divide-zinc-300 max-h-[58vh] overflow-y-scroll border border-zinc-400 shadow-inner">
          {addresses
            .filter((a) => a.balance > 0 || shouldShowEmptyAddresses)
            .map((a, i) => (
              <li key={a.address}>
                <AddressAccordion a={a} i={i} />
              </li>
            ))}
        </ul>
      </div>
    </>
  );
}

function AddressAccordion({ a, i }) {
  const { shouldPreferLocalCurrency } = useSelector(selectCurrencySettings);
  const [isOpen, setIsOpen] = useState(false);

  const wallet = useSelector(selectActiveWallet);
  const UtxoManager = UtxoManagerService(wallet);
  const coins = UtxoManager.getAddressUtxos(a.address);

  const zebraCss = i % 2 === 0 ? "bg-zinc-100" : "bg-zinc-50";

  return (
    <div className={`p-1.5 ${zebraCss}`}>
      <div className="flex text-sm" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex-1 text-sm">
          <span className="font-mono text-xs mr-1 tracking-tighter">
            #{a.hd_index}.{a.change}
          </span>
          <span className="text-sm">
            <Address
              address={a.address}
              short={isOpen ? false : a.balance > 0}
            />
          </span>
          <div className="opacity-90">{a.memo}</div>
        </div>
        {!isOpen && a.balance > 0 && (
          <div className="flex-1 text-right">
            <div className="font-mono">
              <Satoshi value={a.balance} fiat={shouldPreferLocalCurrency} />
            </div>
            <div className="text-sm opacity-80">
              <Satoshi value={a.balance} fiat={!shouldPreferLocalCurrency} />
            </div>
          </div>
        )}
      </div>
      {isOpen && a.balance > 0 && (
        <div className="bg-zinc-50 rounded-sm shadow-inner text-sm mt-1 flex flex-wrap gap-1 justify-between">
          {coins.map((coin) => (
            <Coin key={`${coin.txid}:${coin.tx_pos}`} coin={coin} />
          ))}
        </div>
      )}
    </div>
  );
}

AddressAccordion.propTypes = {
  a: PropTypes.object.isRequired,
  i: PropTypes.number.isRequired,
};

function Coin({ coin }) {
  const { shouldPreferLocalCurrency } = useSelector(selectCurrencySettings);
  const [isSelected, setIsSelected] = useState(false);

  const selectCss = isSelected
    ? "bg-primary text-white"
    : "bg-zinc-50 text-zinc-900";

  const handleSelection = () => {
    setIsSelected(!isSelected);
  };

  return (
    <div
      className={`border rounded border-primary p-1.5 text-sm flex-1 ${selectCss}`}
      onClick={handleSelection}
    >
      <div className="flex items-center">
        <div className="text-base mr-1">
          <MoneyCollectOutlined />
        </div>
        <div>
          <div className="font-mono">
            <Satoshi value={coin.amount} fiat={shouldPreferLocalCurrency} />
          </div>
          <div className="text-sm opacity-80">
            <Satoshi value={coin.amount} fiat={!shouldPreferLocalCurrency} />
          </div>
        </div>
      </div>
    </div>
  );
}

Coin.propTypes = {
  coin: PropTypes.object.isRequired,
};

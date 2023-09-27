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
  return (
    <>
      <ViewHeader icon={BankOutlined} title="Assets" />
      <CoinsBlock />
    </>
  );
}

function CoinsBlock() {
  const wallet = useSelector(selectActiveWallet);

  const [shouldShowEmptyAddresses, setShouldShowEmptyAddresses] =
    useState(false);

  const AddressManager = AddressManagerService(wallet.id);
  const receiveAddresses = AddressManager.getReceiveAddresses();
  const changeAddresses = AddressManager.getChangeAddresses();

  const addresses = [...receiveAddresses, ...changeAddresses];

  return (
    <>
      <div className="m-1">
        <div className="flex">
          <input
            type="checkbox"
            checked={shouldShowEmptyAddresses}
            onChange={(event) =>
              setShouldShowEmptyAddresses(event.target.checked)
            }
          />
          <span className="ml-1">Show Empty Addresses</span>
        </div>
      </div>
      <ul className="bg-zinc-100 text-zinc-600 divide-y divide-zinc-300 max-h-[58vh] overflow-y-scroll border border-zinc-400 shadow-inner">
        {addresses
          .filter((a) => a.balance > 0 || shouldShowEmptyAddresses)
          .map((a) => (
            <li key={a.address}>
              <AddressAccordion a={a} />
            </li>
          ))}
      </ul>
    </>
  );
}

function AddressAccordion({ a }) {
  const { shouldPreferLocalCurrency } = useSelector(selectCurrencySettings);
  const [isOpen, setIsOpen] = useState(false);

  const wallet = useSelector(selectActiveWallet);
  const UtxoManager = UtxoManagerService(wallet.id);
  const coins = UtxoManager.getAddressUtxos(a.address);

  return (
    <div className="p-2">
      <div className="flex text-sm" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex-1 text-sm">
          <span className="font-mono text-xs mr-1">
            #{a.hd_index}.{a.change}
          </span>
          <Address address={a.address} short />
          <div className="opacity-90">{a.memo}</div>
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
      </div>
      {isOpen && a.balance > 0 && (
        <div className="bg-zinc-50 rounded-sm shadow-inner text-sm mt-1 flex flex-wrap gap-1 justify-between">
          {coins.map((coin) => (
            <div className="border rounded border-primary bg-zinc-50 text-zinc-900 p-1.5 text-sm flex-1">
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
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

AddressAccordion.propTypes = {
  a: PropTypes.object.isRequired,
};

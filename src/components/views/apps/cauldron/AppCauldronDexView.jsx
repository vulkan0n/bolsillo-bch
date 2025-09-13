import { useState, useMemo, useEffect } from "react";
import { useLocation } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import {
  CloseOutlined,
  CopyOutlined,
  ExperimentOutlined,
  TransactionOutlined,
} from "@ant-design/icons";
import { selectActiveWalletHash } from "@/redux/wallet";
import FullColumn from "@/layout/FullColumn";
import ViewHeader from "@/layout/ViewHeader";
import Button from "@/atoms/Button";
import Card from "@/atoms/Card";
import TokenIcon from "@/atoms/TokenIcon";
import NumberFormat from "@/atoms/NumberFormat";
import Satoshi from "@/atoms/Satoshi";
import { SatoshiInput } from "@/atoms/SatoshiInput";

import { useClipboard } from "@/hooks/useClipboard";

import AddressManagerService from "@/services/AddressManagerService";
import TokenManagerService from "@/services/TokenManagerService";
import LogService from "@/services/LogService";
import CauldronService from "@/services/CauldronService";

import { MUSD_TOKENID } from "@/util/tokens";

const Log = LogService("AppCauldronDexView");

function useCauldron(tokenId) {
  const [cauldrons, setCauldrons] = useState([]);
  const Cauldron = CauldronService();

  useEffect(
    function fetchCauldrons() {
      const setup = async () => {
        await Cauldron.connect();

        const c = Cauldron.getCauldrons(tokenId);
        setCauldrons(c);
      };

      setup();
    },
    [Cauldron]
  );

  return cauldrons;
}

export default function AppCauldronDexView() {
  const dispatch = useDispatch();
  const location = useLocation();

  const walletHash = useSelector(selectActiveWalletHash);

  const [cauldronToken, setCauldronToken] = useState(MUSD_TOKENID);
  const [isFlipped, setIsFlipped] = useState(false);

  const [supplyInput, setSupplyInput] = useState(0n);
  const [demandInput, setDemandInput] = useState(0n);

  const handleSupplyInput = (sats) => setSupplyInput(sats);
  const handleDemandInput = (sats) => setDemandInput(sats);

  const handleFlipInputs = () => {
    setIsFlipped(!isFlipped);
  };

  const TokenManager = TokenManagerService(walletHash);
  const cauldronTokenData = TokenManager.getToken(cauldronToken);

  const cauldrons = useCauldron(cauldronToken);

  const tokenTotal = cauldrons.reduce(
    (sum, cur) => sum + BigInt(cur.token_amount),
    0n
  );
  const satsTotal = cauldrons.reduce((sum, cur) => sum + BigInt(cur.sats), 0n);

  const price =
    satsTotal > 0 && tokenTotal > 0 ? satsTotal / (tokenTotal / 100n) : 0;

  const tokenList = TokenManager.getTokenCategories();
  const tokenListData = tokenList.map((t) => TokenManager.getToken(t));

  const handleTokenCategorySelect = (event) => {
    setCauldronToken(event.target.value);
  };

  const supplyDemandRender = () => {
    const tokenSpan = (
      <span style={{ color: cauldronTokenData.color }} className="font-bold">
        {cauldronTokenData.symbol}
      </span>
    );

    const bchSpan = <span className="font-bold">BCH</span>;

    return [
      <div>
        <div>
          <span className="text-neutral-500 mr-1">You pay</span>
          {isFlipped ? tokenSpan : bchSpan}
        </div>
        <div className="flex items-center justify-between">
          <SatoshiInput
            satoshis={supplyInput}
            className="text-3xl p-2 rounded w-full border border-primary-700 shadow-inner"
            onChange={handleSupplyInput}
          />
          <div className="ml-2 flex flex-col items-center justify-center">
            <div>
              <TokenIcon
                category={isFlipped ? cauldronToken : "BCH"}
                size={64}
                rounded
              />
            </div>
          </div>
        </div>
      </div>,
      <div>
        <div>
          <span className="text-neutral-500 mr-1">You receive</span>
          {isFlipped ? bchSpan : tokenSpan}
        </div>
        <div className="flex items-center justify-between">
          <SatoshiInput
            satoshis={demandInput}
            className="text-3xl my-1 p-2 rounded w-full border border-primary-700 shadow-inner"
            onChange={handleDemandInput}
          />
          <div className="ml-2 flex flex-col items-center justify-center">
            <TokenIcon
              category={isFlipped ? "BCH" : cauldronToken}
              size={64}
              rounded
            />
          </div>
        </div>
      </div>,
    ];
  };

  return (
    <FullColumn>
      <ViewHeader title="Cauldron DEX" icon={ExperimentOutlined} />
      <div className="p-4">
        <Card>
          <select
            className="w-full p-2 bg-primary-100 text-lg"
            onChange={handleTokenCategorySelect}
            value={cauldronToken}
          >
            {tokenListData.map((t) => (
              <option value={t.category}>{t.symbol}</option>
            ))}
          </select>
        </Card>

        <Card>
          <div className="flex flex-col justify-center p-2">
            {supplyDemandRender()[0]}
            <div className="">
              <Button
                icon={TransactionOutlined}
                padding="2"
                rounded="md"
                onClick={handleFlipInputs}
              />
            </div>
            {supplyDemandRender()[1]}
          </div>
        </Card>

        <div className="my-2">
          <Button label="Swap" fullWidth rounded="lg" inverted labelSize="xl" />
        </div>

        <Card>
          <ul>
            <li>{cauldrons.length} pools</li>
            <li>
              $
              <NumberFormat
                number={tokenTotal}
                decimals={cauldronTokenData.token.decimals}
                scalar={-cauldronTokenData.token.decimals}
              />{" "}
              {cauldronTokenData.symbol}
            </li>
            <li>
              <Satoshi value={satsTotal} fiat={false} />
            </li>
            <li>
              Price: <Satoshi value={price} /> (<Satoshi value={price} flip />)
              per {cauldronTokenData.symbol}
            </li>
          </ul>
        </Card>
      </div>
    </FullColumn>
  );
}

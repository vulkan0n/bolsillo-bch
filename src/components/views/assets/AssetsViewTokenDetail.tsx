import { useSelector } from "react-redux";
import { useParams } from "react-router";
import { selectActiveWalletHash } from "@/redux/wallet";

import LogService from "@/services/LogService";
import BcmrService from "@/services/BcmrService";
import UtxoManagerService from "@/services/UtxoManagerService";

import Checksum from "@/atoms/Checksum";
import NumberFormat from "@/atoms/NumberFormat";

const Log = LogService("AssetsViewTokenDetail");

export default function AssetsViewTokenDetail() {
  const { tokenId } = useParams();
  const walletHash = useSelector(selectActiveWalletHash);

  const Bcmr = BcmrService();
  const token = ((category) => {
    const UtxoManager = UtxoManagerService(walletHash);
    const tokenUtxos = UtxoManager.getWalletTokens();

    let identity = {
      name: `Token ${category.slice(0, 6)}`,
    };

    try {
      identity = Bcmr.getIdentity(category);
    } catch (e) {
      // pass
    }

    const amount = tokenUtxos
      .filter((utxo) => utxo.token_category === category)
      .reduce((total, utxo) => total + utxo.token_amount, 0);

    const nftCount = tokenUtxos.filter(
      (utxo) => utxo.token_category === category && utxo.nft_capability !== null
    ).length;

    const colorHex = `#${category.slice(0, 6)}`;

    return {
      category,
      color: colorHex,
      amount,
      nftCount,
      ...identity,
    };
  })(tokenId);

  return (
    <div>
      <div key={token.category} className="w-full p-1">
        <div className="flex items-center">
          <div className="flex items-center justify-center">
            <span className="border rounded-sm border-zinc-700 overflow-hidden">
              <Checksum data={token.category} canvasSize={96} />
            </span>
          </div>
          <div className="flex flex-col justify-between mx-1">
            <div className="text-sm flex items-baseline">
              <span
                className="font-mono text-xs font-bold pr-1.5 mr-1.5 border-r border-zinc-400/90"
                style={{ color: token.color }}
              >
                {token.token ? token.token.symbol : token.category.slice(0, 6)}
              </span>
              <span className="font-bold text-zinc-700">
                {token.name || `Token ${token.category.slice(0, 6)}`}
              </span>
            </div>
            <div className="flex items-center text-zinc-600 mt-0.5">
              {token.amount > 0 && (
                <span className="text-xs font-mono mr-1.5 flex items-center">
                  <span
                    style={{ color: token.color }}
                    className="relative bottom-[1px] pr-0.5"
                  >
                    &#9679;
                  </span>
                  <NumberFormat
                    number={token.amount}
                    decimals={
                      token.token && token.token.decimals
                        ? token.token.decimals
                        : 0
                    }
                  />
                </span>
              )}
              {token.nftCount > 0 && (
                <div className="text-xs flex items-center">
                  <span
                    style={{ color: token.color }}
                    className="relative bottom-[1px] pr-0.5"
                  >
                    &#9635;
                  </span>
                  <span>{token.nftCount}&nbsp;NFTs</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div>
          {token.description && (
            <div className="p-1 text-sm text-zinc-700">{token.description}</div>
          )}
          <div className="mt-1.5 pt-0.5 border-t border-dashed border-zinc-300/80 font-mono text-xs text-zinc-400/70 truncate">
            {token.category}
          </div>
        </div>
      </div>
      <div className="mt-4">
        {Object.entries(token).map(([k, v]) => (
          <div>
            {k}: {JSON.stringify(v)}
          </div>
        ))}
      </div>
    </div>
  );
}

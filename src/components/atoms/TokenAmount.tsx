import { TokenEntity } from "@/services/TokenManagerService";
import { TokenHistoryEntity } from "@/services/TransactionHistoryService";
import NumberFormat from "@/atoms/NumberFormat";

interface TokenAmountProps {
  token: TokenEntity | TokenHistoryEntity;
  nft?: boolean;
}

export default function TokenAmount({ token, nft = false }: TokenAmountProps) {
  const receiveStyle = "text-secondary";
  const sendStyle = "text-error";

  const tokenColor = token.color || `#${token.category.slice(0, 6)}`;

  return (
    <>
      {nft && (
        <div className="text-xs flex items-center">
          <span
            className="relative bottom-[1px] mr-0.5"
            style={{ color: tokenColor }}
          >
            &#9635;
          </span>
          {token.nft_amount ? (
            <span className={token.nft_amount > 0 ? receiveStyle : sendStyle}>
              <span>
                {token.nft_amount > 0 && "+"}
                {token.nft_amount}
              </span>
            </span>
          ) : (
            <span>{token.nftCount}</span>
          )}
        </div>
      )}
      {!nft && (
        <div className="text-xs flex items-center font-mono">
          <span
            className="relative bottom-[1px] pr-0.5 text-sm"
            style={{ color: tokenColor }}
          >
            &#9679;
          </span>
          {token.fungible_amount ? (
            <span
              className={token.fungible_amount > 0 ? receiveStyle : sendStyle}
            >
              <span>{token.fungible_amount > 0 && "+"}</span>
              <NumberFormat
                number={token.fungible_amount}
                decimals={
                  token.token && token.token.decimals ? token.token.decimals : 0
                }
              />
            </span>
          ) : (
            <NumberFormat
              number={token.amount}
              decimals={
                token.token && token.token.decimals ? token.token.decimals : 0
              }
            />
          )}
        </div>
      )}
    </>
  );
}

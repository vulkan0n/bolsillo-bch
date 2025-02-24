/* eslint-disable react/jsx-props-no-spreading */
import { TransactionOutlined } from "@ant-design/icons";
import { useCurrencyFlip } from "@/hooks/useCurrencyFlip";

interface Props {
  className: string;
}

export default function CurrencyFlip({ className = "", ...rest }: Props) {
  const handleFlipLocalCurrency = useCurrencyFlip();

  return (
    <TransactionOutlined
      className={`cursor-pointer ${className}`}
      onClick={handleFlipLocalCurrency}
      {...rest}
    />
  );
}

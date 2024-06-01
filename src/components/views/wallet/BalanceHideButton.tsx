/* eslint-disable react/jsx-props-no-spreading */
import { useSelector, useDispatch } from "react-redux";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import { selectCurrencySettings, setPreference } from "@/redux/preferences";

interface Props {
  className?: string;
}

export default function BalanceHideButton({ className = "", ...rest }: Props) {
  const dispatch = useDispatch();
  const { shouldHideBalance } = useSelector(selectCurrencySettings);
  const Icon = shouldHideBalance ? EyeInvisibleOutlined : EyeOutlined;

  const hiddenClasses = shouldHideBalance ? "opacity-60" : "opacity-40";

  const handleHideBalance = () => {
    dispatch(
      setPreference({
        key: "hideAvailableBalance",
        value: (!shouldHideBalance).toString(),
      })
    );
  };

  return (
    <Icon
      className={`cursor-pointer w-12 h-12 flex justify-center items-center ${className} ${hiddenClasses}`}
      onClick={handleHideBalance}
      {...rest}
    />
  );
}

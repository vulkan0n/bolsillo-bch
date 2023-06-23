import { useDispatch, useSelector } from "react-redux";
import { selectPreferences, setPreference } from "@/redux/preferences";
import { TransactionOutlined } from "@ant-design/icons";

export default function CurrencyFlip({ className, ...rest }) {
  const dispatch = useDispatch();
  const preferences = useSelector(selectPreferences);
  const preferLocal = preferences["preferLocalCurrency"] === "true";

  const handleFlipLocalCurrency = () => {
    dispatch(
      setPreference({ key: "preferLocalCurrency", value: !preferLocal })
    );
  };

  return (
    <TransactionOutlined
      className={`cursor-pointer ${className}`}
      onClick={handleFlipLocalCurrency}
      {...rest}
    />
  );
}

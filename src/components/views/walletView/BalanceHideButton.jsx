import { useSelector, useDispatch } from "react-redux";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import { selectPreferences, setPreference } from "@/redux/preferences";

export default function BalanceHideButton({ className, ...rest }) {
  const dispatch = useDispatch();
  const preferences = useSelector(selectPreferences);

  const hideBalance = preferences.hideAvailableBalance === "true";
  const Icon = hideBalance ? EyeInvisibleOutlined : EyeOutlined;

  const hiddenClasses = hideBalance ? "opacity-60" : "opacity-40";

  const handleHideBalance = () => {
    dispatch(
      setPreference({ key: "hideAvailableBalance", value: !hideBalance })
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

import { DoubleRightOutlined } from "@ant-design/icons";
import Button from "@/atoms/Button";

interface Props {
  name: string;
  icon?: React.ComponentType;
  to?: string;
}

export default function ExploreApp({
  name,
  icon = () => null,
  to = "",
}: Props) {
  const label = (
    <span className="w-full flex justify-between items-center">
      <span>{name}</span>
      <DoubleRightOutlined />
    </span>
  );

  return (
    <Button
      icon={icon}
      label={label}
      labelSize="lg"
      rounded="lg"
      justify="start"
      shadow="sm"
      fullWidth
      navigateTo={to}
    />
  );
}

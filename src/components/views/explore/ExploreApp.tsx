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
  return (
    <Button
      icon={icon}
      label={name}
      labelSize="lg"
      rounded="lg"
      justify="start"
      shadow="sm"
      fullWidth
      navigateTo={to}
    />
  );
}

import React from "react";
import { View, Text, Pressable } from "react-native";
import styles from "./styles";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import COLOURS from "@selene-wallet/common/design/colours";
import { iconImport, IconType } from "@selene-wallet/app/src/design/icons";
import Loading from "@selene-wallet/app/src/components/atoms/Loading";

interface Props {
  children: any;
  onPress: () => void;
  variant?:
    | "primary"
    | "secondary"
    | "secondaryOnGreen"
    | "blackOutlined"
    | "danger"
    | "smallActionBlack"
    | "smallActionGreen";
  size?: "regular" | "small";
  isDisabled?: boolean;
  isLoading?: boolean;
  icon?: IconType;
}

const Button = ({
  children,
  onPress = () => {},
  variant = "primary",
  size = "regular",
  isDisabled = false,
  isLoading = false,
  icon = "",
}: Props) => {
  const isSmall = size === "small";

  const iconColour = () => {
    if (isDisabled) {
      return COLOURS.lightGrey;
    }

    switch (variant) {
      case "primary":
        return COLOURS.white;
      case "secondary":
        return COLOURS.bchGreen;
      case "blackOutlined":
        return COLOURS.bchGreen;
      case "danger":
        return COLOURS.errorRed;
      case "smallActionBlack":
        return COLOURS.black;
      case "smallActionGreen":
        return COLOURS.bchGreen;
      default:
        return COLOURS.bchGreen;
    }
  };

  const buttonStyle = styles({ variant, isSmall, isDisabled });

  return (
    <Pressable
      onPress={isDisabled ? () => {} : onPress}
      style={buttonStyle.button as any}
    >
      {isLoading && <Loading color={buttonStyle.activityIndicatorColor} />}
      {!isLoading && !!icon && (
        <View style={buttonStyle.iconContainer}>
          <FontAwesomeIcon
            // icon={iconImport(icon)}
            size={20}
            color={iconColour()}
          />
        </View>
      )}
      {!isLoading && <Text style={buttonStyle.buttonText}>{children}</Text>}
    </Pressable>
  );
};

export default Button;

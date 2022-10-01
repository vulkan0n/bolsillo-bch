import SPACING from "@selene/common/design/spacing";
import COLOURS from "@selene/common/design/colours";

const styles = ({ variant = "primary", isSmall = false, isDisabled }) => {
  const isSmallAction =
    variant === "smallActionBlack" || variant === "smallActionGreen";

  const borderColor = () => {
    if (isDisabled) {
      return COLOURS.lightGrey;
    }

    switch (variant) {
      case "primary":
        return COLOURS.bchGreen;
      case "secondary":
        return COLOURS.bchGreen;
      case "secondaryOnGreen":
        return COLOURS.white;
      case "blackOutlined":
        return COLOURS.white;
      case "danger":
        return COLOURS.errorRed;
      case "smallActionBlack":
        return COLOURS.white;
      case "smallActionGreen":
        return COLOURS.white;
      default:
        return COLOURS.bchGreen;
    }
  };

  const backgroundColor = () => {
    if (isDisabled && variant === "blackOutlined") {
      return COLOURS.black;
    }

    if (isDisabled) {
      return COLOURS.white;
    }

    switch (variant) {
      case "primary":
        return COLOURS.bchGreen;
      case "secondary":
        return COLOURS.white;
      case "secondaryOnGreen":
        return COLOURS.white;
      case "blackOutlined":
        return COLOURS.black;
      case "danger":
        return COLOURS.black;
      case "smallActionBlack":
        return COLOURS.white;
      case "smallActionGreen":
        return COLOURS.white;
      default:
        return COLOURS.white;
    }
  };

  const textColor = () => {
    if (isDisabled) {
      return COLOURS.lightGrey;
    }

    switch (variant) {
      case "primary":
        return COLOURS.white;
      case "secondary":
        return COLOURS.bchGreen;
      case "secondaryOnGreen":
        return COLOURS.bchGreen;
      case "blackOutlined":
        return COLOURS.bchGreen;
      case "danger":
        return COLOURS.errorRed;
      case "smallActionBlack":
        return COLOURS.black;
      case "smallActionGreen":
        return COLOURS.black;
      default:
        return COLOURS.bchGreen;
    }
  };

  const shadowColour = () => {
    if (isDisabled) {
      return COLOURS.lightGrey;
    }

    switch (variant) {
      case "primary":
        return COLOURS.black;
      case "secondary":
        return COLOURS.bchGreen;
      case "secondaryOnGreen":
        return COLOURS.black;
      case "blackOutlined":
        return COLOURS.white;
      case "danger":
        return COLOURS.errorRed;
      case "smallActionBlack":
        return COLOURS.white;
      case "smallActionGreen":
        return COLOURS.white;
      default:
        return COLOURS.black;
    }
  };

  return {
    button: {
      marginLeft: isSmall ? 5 : SPACING.fifteen,
      marginRight: isSmall ? 5 : SPACING.fifteen,
      marginBottom: isSmall ? 0 : SPACING.fifteen,
      borderWidth: 2,
      borderRadius: SPACING.borderRadius,
      backgroundColor: backgroundColor(),
      borderColor: borderColor(),
      minHeight: 45,
      height: 65,
      maxHeight: 65,
      width: isSmallAction ? 80 : "100%",
      display: "flex",
      flex: 1,
      flexDirection: isSmallAction ? "column" : "row",
      justifyContent: "center",
      alignItems: "center",
      // iOS drop shadow
      shadowColor: shadowColour(),
      shadowOffset: { width: -2, height: 4 },
      shadowOpacity: isDisabled ? 0 : 0.2,
      shadowRadius: isDisabled ? 0 : 3,
      // Android drop shadow
      elevation: isDisabled ? 0 : 3,
      opacity: isDisabled && variant === "blackOutlined" ? 0.5 : 1,
    },
    iconContainer: {
      marginRight: SPACING.five,
    },
    buttonText: {
      fontFamily: "Montserrat_500Medium",
      fontSize: 24,
      color: textColor(),
    },
    activityIndicatorColor: textColor(),
  };
};

export default styles;

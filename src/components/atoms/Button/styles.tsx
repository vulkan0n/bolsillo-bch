import SPACING from "../../../design/spacing";
import COLOURS from "../../../design/colours";

const styles = ({ variant = "primary", isSmall = false, isDisabled }) => {
  const borderColor = () => {
    if (isDisabled) {
      return COLOURS.lightGrey;
    }

    switch (variant) {
      case "primary":
        return COLOURS.bchGreen;
      case "secondary":
        return COLOURS.bchGreen;
      case "blackOutlined":
        return COLOURS.white;
      default:
        return COLOURS.bchGreen;
    }
  };

  const backgroundColor = () => {
    if (isDisabled) {
      return COLOURS.white;
    }

    switch (variant) {
      case "primary":
        return COLOURS.bchGreen;
      case "secondary":
        return COLOURS.white;
      case "blackOutlined":
        return COLOURS.black;
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
      case "blackOutlined":
        return COLOURS.bchGreen;
      default:
        return COLOURS.bchGreen;
    }
  };

  return {
    button: {
      marginLeft: isSmall ? 0 : SPACING.fifteen,
      marginRight: isSmall ? 0 : SPACING.fifteen,
      marginBottom: isSmall ? 0 : SPACING.fifteen,
      borderWidth: 2,
      borderRadius: SPACING.borderRadius,
      backgroundColor: backgroundColor(),
      borderColor: borderColor(),
      width: isSmall ? "45%" : "100%",
      height: 65,
      display: "flex",
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      // iOS drop shadow
      shadowColor: COLOURS.black,
      shadowOffset: { width: -2, height: 4 },
      shadowOpacity: isDisabled ? 0 : 0.2,
      shadowRadius: isDisabled ? 0 : 3,
      // Android drop shadow
      elevation: isDisabled ? 0 : 3,
    },
    iconContainer: {
      marginRight: SPACING.five,
    },
    buttonText: {
      fontFamily: "Montserrat_500Medium",
      fontSize: 24,
      color: textColor(),
    },
  };
};

export default styles;

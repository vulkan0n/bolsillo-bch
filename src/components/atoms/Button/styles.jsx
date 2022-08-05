import SPACING from "../../../design/spacing";
import COLOURS from "../../../design/colours";

const styles = ({ variant = "primary", isSmall }) => {
  const borderColor = () => {
    switch (variant) {
      case "primary":
        return COLOURS.bchGreen;
      case "secondary":
        return COLOURS.bchGreen;
      default:
        return COLOURS.bchGreen;
    }
  };

  const backgroundColor = () => {
    switch (variant) {
      case "primary":
        return COLOURS.bchGreen;
      case "secondary":
        return COLOURS.white;
      default:
        return COLOURS.white;
    }
  };

  const textColor = () => {
    switch (variant) {
      case "primary":
        return COLOURS.white;
      case "secondary":
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
      shadowOpacity: 0.2,
      shadowRadius: 3,
      // Android drop shadow
      elevation: 3,
    },
    buttonText: {
      fontFamily: "Montserrat_500Medium",
      fontSize: 28,
      color: textColor(),
    },
  };
};

export default styles;

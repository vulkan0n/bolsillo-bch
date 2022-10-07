import SPACING from "@selene-wallet/common/design/spacing";
import COLOURS from "@selene-wallet/common/design/colours";
import SHADOW from "@selene-wallet/app/src/design/shadow";

interface Props {
  isMultiline?: boolean;
  isSmallText?: boolean;
  isPlaceholder: boolean;
}

const styles = ({
  isMultiline = false,
  isSmallText = false,
  isPlaceholder = false,
}: Props) => {
  return {
    input: {
      fontFamily: "Montserrat_500Medium",
      fontSize: isSmallText ? 16 : 28,
      color: isPlaceholder ? COLOURS.lightGrey : COLOURS.black,
      marginLeft: SPACING.fifteen,
      marginRight: SPACING.fifteen,
      marginBottom: SPACING.fifteen,
      paddingLeft: SPACING.fifteen,
      paddingRight: SPACING.fifteen,
      borderWidth: 2,
      borderRadius: SPACING.borderRadius,
      backgroundColor: COLOURS.white,
      borderColor: COLOURS.bchGreen,
      height: isMultiline ? 80 : 65,
      maxHeight: isMultiline ? 80 : 65,
      width: "100%",
      display: "flex",
      flex: 1,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      ...SHADOW,
    },
  };
};

export default styles;

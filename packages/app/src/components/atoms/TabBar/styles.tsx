import SPACING from "@selene-wallet/common/design/spacing";
import COLOURS from "@selene-wallet/common/design/colours";
import TYPOGRAPHY from "@selene-wallet/common/design/typography";

const styles = ({ labelBackgroundColor, isFocused, isDarkMode }) => ({
  wrapper: {
    backgroundColor: labelBackgroundColor,
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: SPACING.five,
    height: 50,
  },
  iconWrapper: {
    marginRight: SPACING.five,
    justifyContent: "center",
  },
  label: {
    ...TYPOGRAPHY.p,
    marginBottom: 0,
    color: isFocused
      ? isDarkMode
        ? COLOURS.white
        : COLOURS.black
      : COLOURS.bchGreen,
    marginLeft: SPACING.five,
  },
});

export default styles;

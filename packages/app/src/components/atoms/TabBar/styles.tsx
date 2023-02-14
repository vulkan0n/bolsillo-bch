import SPACING from "@selene-wallet/common/design/spacing";
import COLOURS from "@selene-wallet/common/design/colours";
import TYPOGRAPHY from "@selene-wallet/common/design/typography";

const styles = ({
  labelBackgroundColor,
  isFocused,
  isDarkMode,
  isHideText,
}) => ({
  wrapper: {
    backgroundColor: labelBackgroundColor,
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: isHideText ? 0 : SPACING.five,
    height: isHideText ? 0 : 50,
  },
  iconWrapper: {
    marginRight: SPACING.five,
    justifyContent: "center",
  },
  label: {
    ...TYPOGRAPHY.p,
    marginBottom: 0,
    color: isFocused
      ? COLOURS.bchGreen
      : isDarkMode
      ? COLOURS.white
      : COLOURS.black,
    marginLeft: SPACING.five,
  },
});

export default styles;

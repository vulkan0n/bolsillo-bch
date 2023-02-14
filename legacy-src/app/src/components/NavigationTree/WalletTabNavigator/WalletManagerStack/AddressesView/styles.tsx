import COLOURS from "@selene-wallet/common/design/colours";
import SPACING from "@selene-wallet/common/design/spacing";

const styles = {
  coinView: {
    height: 80,
    borderColor: COLOURS.lightGrey,
    backgroundColor: COLOURS.white,
    borderWidth: 5,
    justifyContent: "center",
    alignItems: "flex-start",
    padding: SPACING.five,
    margin: SPACING.five,
    borderRadius: SPACING.borderRadius,
  },
  scrollView: {
    backgroundColor: COLOURS.black,
  },
  whiteBackground: {
    backgroundColor: COLOURS.white,
  },
};

export default styles;

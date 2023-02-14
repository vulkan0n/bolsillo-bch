import COLOURS from "@selene-wallet/common/design/colours";
import SPACING from "@selene-wallet/common/design/spacing";
import TYPOGRAPHY from "@selene-wallet/common/design/typography";

const styles = {
  flatList: {
    flex: 1,
    color: "white",
    width: "100%",
    backgroundColor: COLOURS.white,
    padding: SPACING.five,
    borderRadius: SPACING.borderRadius,
  },
  header: { ...TYPOGRAPHY.h1black, marginTop: SPACING.fifteen },
};

export default styles;

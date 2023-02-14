import COLOURS from "@selene-wallet/common/design/colours";
import SPACING from "@selene-wallet/common/design/spacing";

const styles = {
  transactionPad: {
    backgroundColor: COLOURS.white,
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    width: "100%",
    borderRadius: SPACING.borderRadius,
  },
  emptyPad: {
    backgroundColor: COLOURS.white,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    padding: SPACING.ten,
    borderRadius: SPACING.borderRadius,
  },
};

export default styles;

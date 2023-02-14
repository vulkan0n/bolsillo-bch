import SPACING from "@selene-wallet/common/design/spacing";
import COLOURS from "@selene-wallet/common/design/colours";

const styles = {
  entryRow: {
    flex: 2,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    width: "100%",
    margin: SPACING.five,
    marginRight: SPACING.twentyFive,
    marginLeft: SPACING.twentyFive,
  },
  container: { flex: 1, width: "100%" },
  qrScanner: {
    height: "100%",
    width: "100%",
    marginBottom: SPACING.five,
    backgroundColor: COLOURS.lightGrey,
  },
};

export default styles;

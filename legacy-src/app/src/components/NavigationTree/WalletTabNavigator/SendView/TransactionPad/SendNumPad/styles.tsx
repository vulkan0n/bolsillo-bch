import COLOURS from "@selene-wallet/common/design/colours";
import SPACING from "@selene-wallet/common/design/spacing";

const styles = {
  inputBackground: {
    backgroundColor: COLOURS.white,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    borderRadius: SPACING.borderRadius,
  },
  numPad: {
    backgroundColor: COLOURS.lightGrey,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    padding: SPACING.fifteen,
    margin: SPACING.fifteen,
    borderRadius: SPACING.borderRadius,
  },
  qrScannerRow: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    margin: SPACING.five,
  },
  numPadRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
    marginRight: SPACING.five,
    marginLeft: SPACING.five,
  },
  inputButton: {
    minWidth: 50,
    minHeight: 70,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonContainer: {
    marginTop: SPACING.fifteen,
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  activityIndicator: {
    marginTop: SPACING.fifteen,
    marginBottom: SPACING.fifteen,
  },
};

export default styles;

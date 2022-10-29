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
  sliderContainer: {
    marginBottom: SPACING.ten,
    backgroundColor: COLOURS.white,
    borderRadius: SPACING.borderRadius,
    height: SPACING.maxButtonHeight,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLOURS.black,
  },
  sliderChildren: { backgroundColor: COLOURS.white, width: "100%" },
  sliderChildrenWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  sliderHandle: {
    width: SPACING.maxButtonHeight - SPACING.ten,
    margin: SPACING.five,
    borderRadius: SPACING.borderRadius,
    height: SPACING.maxButtonHeight - SPACING.ten,
    backgroundColor: COLOURS.bchGreen,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: COLOURS.lightGrey,
  },
  sliderText: {
    fontFamily: "Montserrat_500Medium",
    fontSize: 24,
    color: COLOURS.black,
    textAlign: "center",
    paddingLeft: 65, // Compensates for width and margin of slider handle
    backgroundColor: COLOURS.white,
  },
  sliderIconContainer: {
    marginLeft: SPACING.five,
  },
};

export default styles;

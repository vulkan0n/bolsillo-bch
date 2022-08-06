import COLOURS from "../../../design/colours";
import SPACING from "../../../design/spacing";

const styles = {
  container: {
    backgroundColor: COLOURS.black,
    padding: SPACING.ten,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 75,
    height: 75,
    marginBottom: SPACING.ten,
  },
  widePressable: {
    width: "100%",
  },
  primaryTitlesWrapper: {
    marginBottom: SPACING.five,
  },
  secondaryTitlesWrapper: {
    marginTop: SPACING.five,
  },
  inputBackground: {
    backgroundColor: COLOURS.white,
    flex: 1,
    justifyContent: "start",
    alignItems: "center",
    width: "100%",
    padding: SPACING.ten,
    marginBottom: SPACING.twentyFive,
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
  numPadRow: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
    margin: SPACING.five,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
};

export default styles;

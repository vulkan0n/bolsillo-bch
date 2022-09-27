import { COLOURS } from "@selene/common";
import SPACING from "@design/spacing";

const styles = {
  inputBackground: {
    backgroundColor: COLOURS.white,
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    width: "100%",
    paddingLeft: SPACING.twentyFive,
    paddingRight: SPACING.twentyFive,
    borderRadius: SPACING.borderRadius,
  },
  receivePad: {
    flex: 1,
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
    padding: SPACING.five,
    margin: SPACING.five,
    borderRadius: SPACING.borderRadius,
  },
  qrBorder: {
    margin: SPACING.five,
    padding: SPACING.fifteen,
    borderWidth: 5,
    borderColor: COLOURS.lightGrey,
  },
  buttonContainer: {
    margin: SPACING.ten,
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
};

export default styles;

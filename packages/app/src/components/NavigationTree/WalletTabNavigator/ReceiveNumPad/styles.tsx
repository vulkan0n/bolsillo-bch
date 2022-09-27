import { COLOURS } from "@selene/common";
import SPACING from "@design/spacing";

const styles = {
  inputBackground: {
    backgroundColor: COLOURS.white,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    borderRadius: SPACING.borderRadius,
    padding: SPACING.fifteen,
  },
  receivePad: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    padding: SPACING.five,
    margin: SPACING.five,
    borderRadius: SPACING.borderRadius,
  },
  qrBorder: {
    margin: SPACING.fifteen,
    padding: SPACING.fifteen,
    borderWidth: 5,
    borderColor: COLOURS.lightGrey,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
};

export default styles;

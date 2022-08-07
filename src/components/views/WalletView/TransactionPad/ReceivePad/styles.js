import COLOURS from "../../../../../design/colours";
import SPACING from "../../../../../design/spacing";

const styles = {
  inputBackground: {
    backgroundColor: COLOURS.white,
    flex: 1,
    justifyContent: "start",
    alignItems: "center",
    width: "100%",
    borderRadius: SPACING.borderRadius,
  },
  receivePad: {
    backgroundColor: COLOURS.lightGrey,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    padding: SPACING.fifteen,
    margin: SPACING.fifteen,
    borderRadius: SPACING.borderRadius,
  },
  qrBorder: {
    margin: SPACING.fifteen,
    borderWidth: 5,
    borderColor: COLOURS.bchGreen,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
};

export default styles;

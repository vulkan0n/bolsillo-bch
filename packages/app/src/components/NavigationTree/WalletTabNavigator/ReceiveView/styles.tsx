import COLOURS from "@selene-wallet/common/design/colours";
import SPACING from "@selene-wallet/common/design/spacing";

const styles = {
  container: {
    flex: 1,
  },
  inputBackground: {
    backgroundColor: COLOURS.white,
    flex: 1,
    justifyContent: "space-between",
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
    backgroundColor: "red",
  },
};

export default styles;

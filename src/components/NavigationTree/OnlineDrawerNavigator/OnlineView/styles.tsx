import COLOURS from "@design/colours";
import SPACING from "@design/spacing";

const styles = {
  scrollView: {
    backgroundColor: COLOURS.black,
  },
  container: {
    backgroundColor: COLOURS.white,
    padding: SPACING.fifteen,
    // justifyContent: "center",
    // alignItems: "center",
    borderRadius: SPACING.borderRadius,
  },
  activeBitcoiners: {
    backgroundColor: COLOURS.black,
    borderColor: COLOURS.black,
    borderWidth: 2,
    borderRadius: SPACING.borderRadius,
    padding: SPACING.fifteen,
    margin: SPACING.ten,
    marginBottom: SPACING.twentyFive,
  },
};

export default styles;

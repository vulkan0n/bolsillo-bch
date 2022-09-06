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
  proposalCard: {
    backgroundColor: COLOURS.white,
    borderColor: COLOURS.black,
    borderWidth: 2,
    borderRadius: SPACING.borderRadius,
    padding: SPACING.ten,
    margin: SPACING.five,
    marginBottom: SPACING.twentyFive,
  },
};

export default styles;

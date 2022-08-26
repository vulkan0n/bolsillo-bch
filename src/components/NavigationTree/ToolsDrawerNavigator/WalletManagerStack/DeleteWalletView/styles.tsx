import COLOURS from "@design/colours";
import SPACING from "@design/spacing";

const styles = {
  scrollView: {
    backgroundColor: COLOURS.black,
  },
  container: {
    backgroundColor: COLOURS.black,
    paddingTop: SPACING.fifteen,
    paddingLeft: SPACING.twentyFive,
    paddingRight: SPACING.twentyFive,
    paddingBottom: SPACING.twentyFive,
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: SPACING.ten,
  },
};

export default styles;

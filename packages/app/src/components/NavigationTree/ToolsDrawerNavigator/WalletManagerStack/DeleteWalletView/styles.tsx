import COLOURS from "@selene/common/design/colours";
import SPACING from "@selene/common/design/spacing";

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

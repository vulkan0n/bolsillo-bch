import COLOURS from "../../../../design/colours";
import SPACING from "../../../../design/spacing";

const styles = {
  scrollView: {
    backgroundColor: COLOURS.black,
  },
  container: {
    backgroundColor: COLOURS.black,
    paddingLeft: SPACING.twentyFive,
    paddingRight: SPACING.twentyFive,
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  optionRow: {
    marginRight: SPACING.fifteen,
    marginLeft: SPACING.fifteen,
    marginTop: SPACING.fifteen,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    width: "100%",
  },
  control: {
    marginLeft: SPACING.fifteen,
  },
  logo: {
    width: 75,
    height: 75,
    marginTop: SPACING.five,
    marginBottom: SPACING.ten,
  },
};

export default styles;

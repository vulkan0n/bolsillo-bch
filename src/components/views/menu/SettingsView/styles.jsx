import COLOURS from "../../../../design/colours";
import SPACING from "../../../../design/spacing";

const styles = {
  container: {
    backgroundColor: COLOURS.black,
    paddingLeft: SPACING.twentyFive,
    paddingRight: SPACING.twentyFive,
    flex: 1,
    justifyContent: "start",
    alignItems: "center",
  },
  optionRow: {
    margin: SPACING.twentyFive,
    padding: SPACING.ten,
    flexDirection: "row",
    alignItems: "center",
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

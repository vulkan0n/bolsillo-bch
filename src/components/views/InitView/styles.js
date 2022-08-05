import COLOURS from "../../../design/colours";
import SPACING from "../../../design/spacing";

const styles = {
  container: {
    backgroundColor: COLOURS.black,
    padding: SPACING.ten,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 200,
    height: 200,
    marginTop: SPACING.twentyFive,
    marginBottom: SPACING.fifteen,
  },
  titleWrapper: {
    marginBottom: SPACING.five,
  },
};

export default styles;

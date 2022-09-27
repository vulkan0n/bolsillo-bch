import COLOURS from "@design/colours";
import SPACING from "@design/spacing";

const styles = {
  container: {
    backgroundColor: COLOURS.white,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 75,
    height: 75,
    marginBottom: SPACING.ten,
  },
  centalContainer: {
    width: "100%",
    paddingRight: SPACING.fifteen,
    paddingLeft: SPACING.fifteen,
  },
  primaryTitlesWrapper: {
    marginBottom: SPACING.five,
  },
};

export default styles;

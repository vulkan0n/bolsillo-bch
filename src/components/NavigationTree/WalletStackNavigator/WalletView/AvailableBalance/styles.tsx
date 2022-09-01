import COLOURS from "@design/colours";
import SPACING from "@design/spacing";

const styles = {
  container: {
    backgroundColor: COLOURS.black,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: {
    width: 75,
    height: 75,
    marginBottom: SPACING.ten,
  },
  primaryTitlesWrapper: {
    marginBottom: SPACING.five,
  },
};

export default styles;

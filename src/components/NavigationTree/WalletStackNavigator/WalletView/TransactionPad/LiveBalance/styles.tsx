import COLOURS from "@design/colours";
import SPACING from "@design/spacing";

const styles = {
  secondaryTitlesWrapper: {
    marginTop: SPACING.five,
  },
  padError: {
    color: COLOURS.errorRed,
    fontSize: 18,
    textAlign: "center",
  },
  sideBlock: {
    width: 70,
    marginRight: SPACING.fifteen,
    marginLeft: SPACING.fifteen,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
};

export default styles;

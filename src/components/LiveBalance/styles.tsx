import COLOURS from "@design/colours";
import SPACING from "@design/spacing";

const styles = {
  secondaryTitlesWrapper: {
    flex: 1,
    marginTop: SPACING.five,
    justifyContent: "center",
    alignItems: "center",
  },
  padError: {
    color: COLOURS.errorRed,
    fontSize: 18,
    textAlign: "center",
  },
  sideBlock: {
    width: 75,
    marginRight: SPACING.ten,
    marginLeft: SPACING.ten,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
};

export default styles;

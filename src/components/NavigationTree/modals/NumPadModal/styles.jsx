import COLOURS from "@design/colours";
import SPACING from "@design/spacing";

const styles = {
  container: {
    backgroundColor: COLOURS.white,
    padding: SPACING.fifteen,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: SPACING.twentyFive,
  },
  motiView: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  iconWrapper: {
    marginBottom: SPACING.twentyFive,
  },
  objectWrapper: {
    flexDirection: "row",
    height: 80,
    minHeight: 80,
  },
};

export default styles;

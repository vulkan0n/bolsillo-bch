import { COLOURS } from "@selene/common";
import { SPACING } from "@selene/common";

const styles = {
  container: {
    backgroundColor: COLOURS.black,
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
  whiteWrapper: {
    backgroundColor: COLOURS.white,
    borderRadius: SPACING.borderRadius,
  },
  objectWrapper: {
    flexDirection: "row",
    height: 80,
    minHeight: 80,
  },
};

export default styles;

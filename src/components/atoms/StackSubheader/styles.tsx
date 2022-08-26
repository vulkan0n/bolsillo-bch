import COLOURS from "@design/colours";
import SPACING from "@design/spacing";
import TYPOGRAPHY from "@design/typography";

const styles = {
  wrapper: {
    width: "100%",
    height: 40,
    backgroundColor: COLOURS.black,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  left: {
    width: 60,
    height: "100%",
    marginLeft: SPACING.fifteen,
  },
  pressable: {
    flex: 1,
    justifyContent: "flex-end",
  },
  title: {
    ...TYPOGRAPHY.h2,
    marginBottom: 0,
    marginTop: SPACING.five,
  },
  right: { width: 60, marginRight: SPACING.fifteen },
};

export default styles;

import COLOURS from "@design/colours";
import SPACING from "@design/spacing";
import TYPOGRAPHY from "@design/typography";

const styles = ({ isSubtitle }) => ({
  wrapper: {
    width: "100%",
    height: isSubtitle ? 65 : 45,
    backgroundColor: COLOURS.black,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: SPACING.five,
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
    marginBottom: SPACING.five,
    marginTop: SPACING.five,
  },
  right: { width: 60, marginRight: SPACING.fifteen },
});

export default styles;

import { COLOURS } from "@selene/common";
import { SPACING } from "@selene/common";
import { TYPOGRAPHY } from "@selene/common";

const HEADER_HEIGHT = 60;

const styles = {
  drawerLabelStyle: {
    color: COLOURS.white,
    ...TYPOGRAPHY.pWhiteLeft,
  },
  drawerContentStyle: {
    backgroundColor: COLOURS.black,
  },
  headerContainer: {
    height: HEADER_HEIGHT,
    backgroundColor: COLOURS.black,
    justifyContent: "space-between",
    alignItems: "flex-end",
    flexDirection: "row",
    paddingLeft: SPACING.fifteen,
    paddingRight: SPACING.fifteen,
  },
  drawerButton: {
    height: "100%",
    width: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  titleContentContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  spacer: { width: 50 },
  headerStyle: {
    height: HEADER_HEIGHT,
  },
};

export default styles;

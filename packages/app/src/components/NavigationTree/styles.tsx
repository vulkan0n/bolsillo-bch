import COLOURS from "@selene-wallet/common/design/colours";
import SPACING from "@selene-wallet/common/design/spacing";

const styles = {
  tabBar: {
    backgroundColor: COLOURS.black,
    borderTopWidth: 0,
    paddingTop: SPACING.ten,
  },
  tabBarLabel: {
    paddingBottom: SPACING.five,
  },
  header: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
};

export default styles;

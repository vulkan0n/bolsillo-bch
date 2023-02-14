import SPACING from "@selene-wallet/common/design/spacing";
import TYPOGRAPHY from "@selene-wallet/common/design/typography";

const styles = {
  container: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  padding: {
    flex: 1,
    paddingLeft: SPACING.ten,
    paddingRight: SPACING.ten,
  },
  fixedWidth: { width: 100 },
  coinButton: {
    ...TYPOGRAPHY.pGreenUnderlined,
    paddingBottom: SPACING.ten,
  },
  coinActive: {
    ...TYPOGRAPHY.pWhite,
    paddingBottom: SPACING.ten,
  },
};

export default styles;

import COLOURS from "@selene-wallet/common/design/colours";
import SPACING from "@selene-wallet/common/design/spacing";
import TYPOGRAPHY from "@selene-wallet/common/design/typography";

const styles = {
  container: {
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    backgroundColor: COLOURS.veryLightGrey,
    paddingVertical: SPACING.five,
    width: "100%",
  },
  text: {
    ...TYPOGRAPHY.p,
    marginTop: 5,
    marginBottom: 5,
    marginLeft: 15,
    marginRight: 15,
  },
};

export default styles;

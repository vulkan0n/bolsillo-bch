import COLOURS from "@selene-wallet/common/design/colours";
import SPACING from "@selene-wallet/common/design/spacing";

const styles = {
  scrollView: {
    backgroundColor: COLOURS.black,
  },
  container: {
    backgroundColor: COLOURS.black,
    paddingTop: SPACING.fifteen,
    paddingLeft: SPACING.twentyFive,
    paddingRight: SPACING.twentyFive,
    paddingBottom: SPACING.twentyFive,
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: SPACING.fifteen,
  },
  mnemonicContainer: {
    padding: SPACING.ten,
    margin: SPACING.ten,
    borderColor: COLOURS.white,
    borderWidth: 2,
    borderRadius: SPACING.borderRadius,
  },
  logo: {
    width: 75,
    height: 75,
    marginTop: SPACING.five,
    marginBottom: SPACING.ten,
  },
};

export default styles;

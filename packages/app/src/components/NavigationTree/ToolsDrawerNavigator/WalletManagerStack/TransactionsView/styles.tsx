import { COLOURS } from "@selene/common";
import { SPACING } from "@selene/common";

const styles = {
  scrollView: {
    backgroundColor: COLOURS.white,
  },
  container: {
    backgroundColor: COLOURS.white,
    paddingTop: SPACING.fifteen,
    paddingLeft: SPACING.ten,
    paddingRight: SPACING.ten,
    paddingBottom: SPACING.ten,
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  headerBox: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: SPACING.fifteen,
    marginRight: SPACING.fifteen,
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

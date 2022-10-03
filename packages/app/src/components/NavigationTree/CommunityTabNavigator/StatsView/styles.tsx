import COLOURS from "@selene/common/design/colours";
import SPACING from "@selene/common/design/spacing";

const styles = {
  scrollView: {
    backgroundColor: COLOURS.black,
  },
  container: {
    backgroundColor: COLOURS.white,
    padding: SPACING.ten,
    borderRadius: SPACING.borderRadius,
  },
  activeBitcoiners: {
    backgroundColor: COLOURS.white,
    borderColor: COLOURS.lightGrey,
    borderWidth: 2,
    borderRadius: SPACING.borderRadius,
    padding: SPACING.fifteen,
    marginTop: SPACING.ten,
    marginBottom: SPACING.fifteen,
  },
};

export default styles;

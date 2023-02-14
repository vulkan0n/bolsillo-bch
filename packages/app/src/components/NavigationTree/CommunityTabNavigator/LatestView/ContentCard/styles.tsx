import COLOURS from "@selene-wallet/common/design/colours";
import SPACING from "@selene-wallet/common/design/spacing";

const styles = {
  contentContainer: {
    paddingTop: SPACING.five,
    marginVertical: SPACING.five,
    backgroundColor: COLOURS.veryLightGrey,
    borderColor: COLOURS.lightGrey,
    borderWidth: 2,
    borderRadius: SPACING.borderRadius,
  },
  textWrapper: {
    marginHorizontal: SPACING.ten,
  },
  loading: {
    height: 225,
    backgroundColor: COLOURS.black,
    marginBottom: SPACING.fifteen,
  },
};

export default styles;

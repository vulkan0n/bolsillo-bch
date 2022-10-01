import SPACING from "@selene/common/design/spacing";
import COLOURS from "@selene/common/design/colours";

const styles = ({ variant = "" }) => ({
  pressableCard: {
    margin: 10,
    padding: 10,
    height: 150,
    width: variant === "wide" ? 320 : 150,
    backgroundColor: COLOURS.black,
    borderRadius: SPACING.borderRadius,
    borderWidth: 2,
    borderColor: COLOURS.bchGreen,
    // iOS drop shadow
    shadowColor: COLOURS.bchGreen,
    shadowOffset: { width: -2, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    // Android drop shadow
    elevation: 3,
  },
  iconWrapper: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginTop: SPACING.ten,
    marginBottom: SPACING.ten,
  },
});

export default styles;

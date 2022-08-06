import COLOURS from "../../../design/colours";
import SPACING from "../../../design/spacing";

const styles = {
  container: {
    backgroundColor: COLOURS.black,
    padding: SPACING.ten,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 75,
    height: 75,
    marginTop: SPACING.five,
    marginBottom: SPACING.ten,
  },
  menuContainer: {
    backgroundColor: COLOURS.white,
    padding: SPACING.ten,
    flex: 1,
    justifyContent: "start",
    alignItems: "center",
    borderRadius: SPACING.borderRadius,
    margin: SPACING.fifteen,
    width: "100%",
  },
  menuRow: {
    height: 170,
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  pressableCard: {
    margin: 10,
    height: 150,
    width: 150,
    backgroundColor: COLOURS.white,
    borderRadius: SPACING.borderRadius,
    // iOS drop shadow
    shadowColor: COLOURS.black,
    shadowOffset: { width: -2, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    // Android drop shadow
    elevation: 3,
  },
};

export default styles;

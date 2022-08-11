import COLOURS from "../../../../../design/colours";
import SPACING from "../../../../../design/spacing";

const styles = {
  container: {
    backgroundColor: COLOURS.black,
    paddingLeft: SPACING.five,
    paddingRight: SPACING.five,
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  logo: {
    width: 75,
    height: 75,
    marginTop: SPACING.five,
    marginBottom: SPACING.ten,
  },
  background: {
    backgroundColor: COLOURS.white,
    padding: SPACING.twentyFive,
    borderRadius: SPACING.borderRadius,
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    width: "100%",
  },
  icon: {
    margin: SPACING.fifteen,
    marginBottom: SPACING.twentyFive,
  },
  menuRow: {
    height: 100,
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  pressableCard: {
    margin: 10,
    padding: 5,
    height: 80,
    width: 80,
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
    marginTop: SPACING.five,
    marginBottom: SPACING.ten,
  },
};

export default styles;

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
    marginTop: SPACING.twentyFive,
    marginBottom: SPACING.twentyFive,
  },
  menuContainer: {
    backgroundColor: COLOURS.black,
    padding: SPACING.ten,
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    borderRadius: SPACING.borderRadius,
    marginLeft: SPACING.fifteen,
    marginRight: SPACING.fifteen,
    width: "100%",
  },
  menuRow: {
    height: 170,
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
};

export default styles;

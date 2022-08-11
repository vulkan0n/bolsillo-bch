import COLOURS from "../../../../design/colours";
import SPACING from "../../../../design/spacing";

const styles = {
  container: {
    backgroundColor: COLOURS.black,
    padding: SPACING.twentyFive,
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
};

export default styles;

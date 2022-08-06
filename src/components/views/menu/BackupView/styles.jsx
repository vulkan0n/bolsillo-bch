import COLOURS from "../../../../design/colours";
import SPACING from "../../../../design/spacing";

const styles = {
  container: {
    backgroundColor: COLOURS.black,
    padding: SPACING.twentyFive,
    flex: 1,
    justifyContent: "start",
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: SPACING.ten,
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

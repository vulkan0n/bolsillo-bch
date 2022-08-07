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
    marginBottom: SPACING.ten,
  },
  widePressable: {
    width: "100%",
  },
  primaryTitlesWrapper: {
    marginBottom: SPACING.five,
  },
  secondaryTitlesWrapper: {
    marginTop: SPACING.five,
  },
};

export default styles;

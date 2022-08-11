import SPACING from "../../../design/spacing";
import COLOURS from "../../../design/colours";

const styles = {
  input: {
    fontFamily: "Montserrat_500Medium",
    fontSize: 28,
    color: COLOURS.black,
    marginLeft: SPACING.fifteen,
    marginRight: SPACING.fifteen,
    marginBottom: SPACING.fifteen,
    paddingLeft: SPACING.fifteen,
    paddingRight: SPACING.fifteen,
    borderWidth: 2,
    borderRadius: SPACING.borderRadius,
    backgroundColor: COLOURS.white,
    borderColor: COLOURS.bchGreen,
    width: "100%",
    height: 65,
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
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

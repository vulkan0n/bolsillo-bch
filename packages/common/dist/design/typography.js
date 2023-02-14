"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const colours_1 = __importDefault(require("./colours"));
const spacing_1 = __importDefault(require("./spacing"));
const TYPOGRAPHY = {
  title: {
    fontFamily: "Montserrat_700Bold",
    textAlign: "center",
    color: colours_1.default.white,
    fontSize: 50,
    marginBottom: spacing_1.default.ten,
  },
  subtitle: {
    fontFamily: "Montserrat_500Medium",
    textAlign: "center",
    color: colours_1.default.white,
    fontSize: 25,
    marginBottom: spacing_1.default.twentyFive,
  },
  header: {
    fontFamily: "Montserrat_500Medium",
    textAlign: "center",
    color: colours_1.default.white,
    fontSize: 18,
  },
  whiteLink: {
    fontFamily: "Montserrat_500Medium",
    textAlign: "center",
    color: colours_1.default.white,
    fontSize: 18,
    textDecorationLine: "underline",
    marginTop: spacing_1.default.ten,
    marginBottom: spacing_1.default.ten,
  },
  h1: {
    fontFamily: "Montserrat_600SemiBold",
    textAlign: "center",
    color: colours_1.default.white,
    fontSize: 28,
    marginBottom: spacing_1.default.ten,
  },
  h1black: {
    fontFamily: "Montserrat_600SemiBold",
    textAlign: "center",
    color: colours_1.default.black,
    fontSize: 28,
    marginBottom: spacing_1.default.ten,
  },
  h1red: {
    fontFamily: "Montserrat_600SemiBold",
    textAlign: "center",
    color: colours_1.default.errorRed,
    fontSize: 28,
    marginBottom: spacing_1.default.ten,
  },
  h2: {
    fontFamily: "Montserrat_500Medium",
    textAlign: "center",
    color: colours_1.default.white,
    fontSize: 22,
    marginBottom: spacing_1.default.ten,
  },
  h2Left: {
    fontFamily: "Montserrat_500Medium",
    textAlign: "flex-start",
    color: colours_1.default.white,
    fontSize: 22,
    marginBottom: spacing_1.default.ten,
  },
  h2black: {
    fontFamily: "Montserrat_500Medium",
    textAlign: "center",
    color: colours_1.default.black,
    fontSize: 22,
    marginBottom: spacing_1.default.ten,
  },
  h2Green: {
    fontFamily: "Montserrat_500Medium",
    textAlign: "center",
    color: colours_1.default.bchGreen,
    fontSize: 22,
    marginBottom: spacing_1.default.ten,
  },
  menuHeaderGreen: {
    fontFamily: "Montserrat_500Medium",
    textAlign: "center",
    color: colours_1.default.bchGreen,
    fontSize: 22,
  },
  subMenuHeaderWhite: {
    fontFamily: "Montserrat_500Medium",
    textAlign: "center",
    color: colours_1.default.white,
    fontSize: 16,
  },
  subMenuHeaderWhite14: {
    fontFamily: "Montserrat_500Medium",
    textAlign: "center",
    color: colours_1.default.white,
    fontSize: 14,
  },
  subMenuHeaderWhite12: {
    fontFamily: "Montserrat_500Medium",
    textAlign: "center",
    color: colours_1.default.white,
    fontSize: 12,
  },
  p: {
    fontFamily: "Montserrat_500Medium",
    textAlign: "center",
    color: colours_1.default.black,
    fontSize: 16,
    marginBottom: spacing_1.default.ten,
  },
  pCentered: {
    fontFamily: "Montserrat_500Medium",
    textAlign: "center",
    color: colours_1.default.black,
    fontSize: 16,
  },
  pLeft: {
    fontFamily: "Montserrat_500Medium",
    textAlign: "flex-start",
    color: colours_1.default.black,
    fontSize: 16,
    marginBottom: spacing_1.default.ten,
  },
  pWhite: {
    fontFamily: "Montserrat_500Medium",
    textAlign: "center",
    color: colours_1.default.white,
    fontSize: 16,
    marginBottom: spacing_1.default.ten,
  },
  pUnderlined: {
    fontFamily: "Montserrat_500Medium",
    textAlign: "center",
    color: colours_1.default.black,
    fontSize: 16,
    marginBottom: spacing_1.default.ten,
    textDecorationLine: "underline",
  },
  pWhiteUnderlined: {
    fontFamily: "Montserrat_500Medium",
    textAlign: "center",
    color: colours_1.default.white,
    fontSize: 16,
    marginBottom: spacing_1.default.ten,
    textDecorationLine: "underline",
  },
  pGreenUnderlined: {
    fontFamily: "Montserrat_500Medium",
    textAlign: "center",
    color: colours_1.default.bchGreen,
    fontSize: 16,
    marginBottom: spacing_1.default.ten,
    textDecorationLine: "underline",
  },
  pWhiteLeft: {
    fontFamily: "Montserrat_500Medium",
    textAlign: "flex-start",
    color: colours_1.default.white,
    fontSize: 16,
    marginBottom: spacing_1.default.ten,
  },
  pRed: {
    fontFamily: "Montserrat_500Medium",
    textAlign: "center",
    color: colours_1.default.errorRed,
    fontSize: 16,
    marginBottom: spacing_1.default.ten,
  },
  spacer: {
    height: spacing_1.default.fifteen,
  },
};
exports.default = TYPOGRAPHY;
//# sourceMappingURL=typography.js.map

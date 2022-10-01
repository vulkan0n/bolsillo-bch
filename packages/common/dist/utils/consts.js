"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IS_WEB = void 0;
const react_native_1 = require("react-native");
console.log({ Platform: react_native_1.Platform });
exports.IS_WEB = react_native_1.Platform.OS === "web";
//# sourceMappingURL=consts.js.map
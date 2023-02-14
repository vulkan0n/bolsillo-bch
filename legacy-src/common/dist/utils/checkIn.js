"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const consts_1 = require("./consts");
const inferCheckInWindow = (period) => {
    switch (period) {
        case consts_1.CHECK_IN_PERIOD_TYPES.daily:
            return "day";
        case consts_1.CHECK_IN_PERIOD_TYPES.weekly:
            return "week";
        case consts_1.CHECK_IN_PERIOD_TYPES.monthly:
            return "month";
        case consts_1.CHECK_IN_PERIOD_TYPES.yearly:
            return "year";
        default:
            return "day";
    }
};
exports.default = inferCheckInWindow;
//# sourceMappingURL=checkIn.js.map
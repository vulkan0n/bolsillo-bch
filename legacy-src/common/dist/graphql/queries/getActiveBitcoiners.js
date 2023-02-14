"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@apollo/client");
const GET_ACTIVE_BITCOINERS = (0, client_1.gql) `
  query GetActiveBitcoiners($period: String!) {
    activeBitcoiners(period: $period) {
      date
      count
    }
  }
`;
exports.default = GET_ACTIVE_BITCOINERS;
//# sourceMappingURL=getActiveBitcoiners.js.map
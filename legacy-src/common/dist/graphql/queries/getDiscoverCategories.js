"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@apollo/client");
const GET_DISCOVER_CATEGORIES = (0, client_1.gql) `
  query GetDiscoverCategories {
    categories {
      name
      description
      items {
        name
        description
        url
      }
    }
  }
`;
exports.default = GET_DISCOVER_CATEGORIES;
//# sourceMappingURL=getDiscoverCategories.js.map
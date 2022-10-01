"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@apollo/client");
const GET_CONTENT = (0, client_1.gql) `
  query GetContent {
    content {
      key
      title
      creator
      publicationDate
      videoId
      description
      donationBchAddress
    }
  }
`;
exports.default = GET_CONTENT;
//# sourceMappingURL=getContent.js.map
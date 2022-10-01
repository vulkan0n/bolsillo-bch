const { gql } = require("apollo-server");

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = gql`
  scalar Date

  type ContentItem {
    key: Int
    title: String
    creator: String
    videoId: String
    description: String
    donationBchAddress: String
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each.
  type Query {
    content: [ContentItem]
  }
`;

module.exports = typeDefs;

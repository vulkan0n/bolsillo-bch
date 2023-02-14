const { gql } = require("apollo-server");

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = gql`
  scalar Date

  type ServerResponse {
    status: String
  }

  type ContentItem {
    key: Int
    title: String
    creator: String
    publicationDate: Date
    videoId: String
    description: String
    donationBchAddress: String
  }

  type DiscoverItem {
    name: String
    description: String
    url: String
  }

  type DiscoverCategory {
    name: String
    description: String
    items: [DiscoverItem]
  }

  # Because timezones are tricky to manage, dates are stored
  # as a 'YYYYMMDD' string to be parsed with moment.js
  type StatAtDate {
    date: String
    count: Int
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each.
  type Query {
    content: [ContentItem]
    categories: [DiscoverCategory]
    activeBitcoiners(period: String!): [StatAtDate]
  }

  type Mutation {
    sendCheckIn(period: String!, date: String!): ServerResponse
  }
`;

module.exports = typeDefs;

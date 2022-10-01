const { dateScalar } = require("./scalars.ts");
const contentItems = require("./contentItems.ts");
const moment = require("moment");

const dailyActiveBitcoinersStats = [
  { date: "20221001", count: 1 },
  { date: "20221002", count: 2 },
  { date: "20221003", count: 3 },
];

// Resolvers define the technique for fetching the types defined in the
// schema. This resolver retrieves books from the "books" array above.
const resolvers = {
  Date: dateScalar,
  Query: {
    content: () => contentItems,
    dailyActiveBitcoiners: () => dailyActiveBitcoinersStats,
  },
};

module.exports = resolvers;

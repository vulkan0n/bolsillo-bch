const { dateScalar } = require("./scalars.ts");
const contentItems = require("./contentItems.ts");

const labels = ["23/9", "24/9", "25/9", "26/9"];
const dailyActiveUserCount = [1, 5, 10, 10];

// Resolvers define the technique for fetching the types defined in the
// schema. This resolver retrieves books from the "books" array above.
const resolvers = {
  Date: dateScalar,
  Query: {
    content: () => contentItems,
  },
};

module.exports = resolvers;

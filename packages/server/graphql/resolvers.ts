import { CheckInPeriodTypes } from "@selene-wallet/common/dist/types";

const { dateScalar } = require("./scalars.ts");
const contentItems = require("./query/contentItems.ts");
const discoverCategories = require("./query/discoverCategories.ts");
const activeBitcoiners = require("./query/activeBitcoiners.ts");
const sendCheckIn = require("./mutation/sendCheckIn.ts");
const prisma = require("../prisma/client");

// Resolvers define the technique for fetching the types defined in the
// schema. This resolver retrieves books from the "books" array above.
const resolvers = {
  Date: dateScalar,
  Query: {
    content: () => contentItems,
    categories: () => discoverCategories,
    activeBitcoiners,
  },
  Mutation: {
    sendCheckIn,
  },
};

module.exports = resolvers;

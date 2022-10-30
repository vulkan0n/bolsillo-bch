import { CheckInPeriodTypes } from "@selene-wallet/common/dist/types";

const { dateScalar } = require("./scalars.ts");
const contentItems = require("./query/contentItems.ts");
const activeBitcoiners = require("./query/activeBitcoiners.ts");
const prisma = require("../prisma/client");

// Resolvers define the technique for fetching the types defined in the
// schema. This resolver retrieves books from the "books" array above.
const resolvers = {
  Date: dateScalar,
  Query: {
    content: () => contentItems,
    activeBitcoiners,
  },
  Mutation: {
    sendCheckIn: async (
      _: any,
      { period, date }: { period: CheckInPeriodTypes; date: string }
    ) => {
      const checkIn = await prisma.default.checkIn.create({
        data: {
          period,
          date,
        },
      });

      console.log({ checkIn });
      return {
        status: "SUCCESS",
      };
    },
  },
};

module.exports = resolvers;

const { dateScalar } = require("./scalars.ts");
const contentItems = require("./contentItems.ts");
// const moment = require("moment");
const prisma = require("../prisma/client");

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
    dailyActiveBitcoiners: async () => {
      const dates = ["20221001", "20221002", "20221003", "20221009"];

      const dailyActiveBitcoinersStats = await Promise.all(
        dates.map(async (date) => {
          const count = await prisma.default.checkIn.count({
            where: {
              type: "daily",
              date,
            },
          });

          return {
            date,
            count,
          };
        })
      );

      console.log({ dailyActiveBitcoinersStats });

      return dailyActiveBitcoinersStats;
    },
  },
  Mutation: {
    dailyCheckIn: async (_: any, { date }: { date: string }) => {
      // console.log("Daily check in!");
      // console.log({ date });

      const checkIn = await prisma.default.checkIn.create({
        data: {
          type: "daily",
          date,
        },
      });

      // console.log({ checkIn });
    },
  },
};

module.exports = resolvers;

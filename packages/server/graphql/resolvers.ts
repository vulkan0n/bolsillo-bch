import { CheckInPeriodTypes } from "@selene/common/dist/types";
import { CHECK_IN_PERIOD_TYPES } from "@selene/common/dist/utils/consts";

const { dateScalar } = require("./scalars.ts");
const contentItems = require("./contentItems.ts");
// const moment = require("moment");
const prisma = require("../prisma/client");

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
              period: CHECK_IN_PERIOD_TYPES.daily,
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
    sendCheckIn: async (
      _: any,
      { period, date }: { period: CheckInPeriodTypes; date: string }
    ) => {
      console.log("Daily check in!");
      console.log({ period, date });

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

import { CheckInPeriodTypes } from "@selene-wallet/common/dist/types";
import { CHECK_IN_PERIOD_TYPES } from "@selene-wallet/common/dist/utils/consts";
import moment from "moment";
import inferCheckInWindow from "@selene-wallet/common/dist/utils/checkIn";

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
    activeBitcoiners: async (
      _: any,
      { period }: { period: CheckInPeriodTypes }
    ) => {
      console.log({ period });

      const duration = inferCheckInWindow(period);

      // Last week of dates
      const numberArray = [...Array(7).keys()];
      const dates = numberArray
        .map((n) => moment.utc().subtract(n, duration).format("YYYYMMDD"))
        .reverse();

      console.log({ dates });

      const dailyActiveBitcoinersStats = await Promise.all(
        dates.map(async (date) => {
          const count = await prisma.default.checkIn.count({
            where: {
              period,
              date,
            },
          });

          return {
            date,
            count,
          };
        })
      );

      return dailyActiveBitcoinersStats;
    },
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

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
      const duration = inferCheckInWindow(period);

      const numberArray = [...Array(7).keys()];
      const now = moment.utc();
      const timeBlocks = numberArray
        .map((n) => {
          const anchor = now.clone().subtract(n, duration);
          const end = anchor.clone().endOf(duration);
          const start = end.clone().startOf(duration);

          return {
            start,
            end,
          };
        })
        .reverse();

      const activeBitcoinerStats = await Promise.all(
        timeBlocks.map(async ({ start, end }) => {
          const count = await prisma.default.checkIn.count({
            where: {
              period,
              createdAt: {
                gte: start.format(),
                lte: end.format(),
              },
            },
          });

          return {
            date: end.format("YYYYMMDD"),
            count,
          };
        })
      );

      return activeBitcoinerStats;
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

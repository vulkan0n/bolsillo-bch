import moment from "moment";
import inferCheckInWindow from "@selene-wallet/common/dist/utils/checkIn";
import { CheckInPeriodTypes } from "@selene-wallet/common/dist/types";
const prisma = require("../../prisma/client");

const activeBitcoiners = async (
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
};

module.exports = activeBitcoiners;
